import { createClient } from 'jsr:@supabase/supabase-js@2'

const API_URL = 'https://v3.football.api-sports.io'
const LEAGUE_ID = 128   // Liga Profesional Argentina
const SEASON    = 2026
const COMPETITION = 'apertura_2026'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  // Auth: acepta el service role key (desde pg_cron) o el sync secret
  const auth = req.headers.get('Authorization') ?? ''
  const syncSecret = req.headers.get('x-sync-secret') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const configuredSecret = Deno.env.get('SYNC_SECRET') ?? ''

  const ok = auth === `Bearer ${serviceKey}` || (configuredSecret && syncSecret === configuredSecret)
  if (!ok) return json({ error: 'No autorizado' }, 401)

  const apiKey = Deno.env.get('API_FOOTBALL_KEY')
  if (!apiKey) return json({ error: 'API_FOOTBALL_KEY no configurada' }, 500)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    serviceKey,
  )

  const apiHeaders = { 'x-apisports-key': apiKey }
  const today = new Date().toISOString().split('T')[0]

  let updatedLive = 0
  let updatedFinished = 0

  try {
    // ── 1. Partidos EN VIVO ──────────────────────────────────
    const liveRes = await fetch(`${API_URL}/fixtures?live=${LEAGUE_ID}`, { headers: apiHeaders })
    const liveData = await liveRes.json()
    for (const fix of liveData.response ?? []) {
      if (await upsertMatch(supabase, fix, 'live')) updatedLive++
    }

    // ── 2. Partidos FINALIZADOS hoy (FT, AET, PEN) ──────────
    // Usamos date range para cubrir partidos que empezaron ayer ART pero terminaron hoy UTC
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const ftRes = await fetch(
      `${API_URL}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&from=${yesterday}&to=${today}`,
      { headers: apiHeaders },
    )
    const ftData = await ftRes.json()
    const FINISHED_STATUSES = ['FT', 'AET', 'PEN', 'AWD', 'WO']
    const getStatus = (f: Record<string, unknown>) =>
      ((f.fixture as Record<string, unknown>)?.status as Record<string, unknown>)?.short as string ?? ''
    const finishedFixtures = (ftData.response ?? []).filter(
      (f: Record<string, unknown>) => FINISHED_STATUSES.includes(getStatus(f))
    )

    console.log(`sync-scores: API live=${liveData.response?.length ?? 0} finished=${finishedFixtures.length}`)
    console.log('Live fixtures:', JSON.stringify((liveData.response ?? []).map((f: Record<string, unknown>) => ({
      home: ((f.teams as Record<string, unknown>)?.home as Record<string, unknown>)?.name,
      away: ((f.teams as Record<string, unknown>)?.away as Record<string, unknown>)?.name,
      status: getStatus(f), goals: f.goals,
    }))))
    console.log('Finished fixtures:', JSON.stringify(finishedFixtures.map((f: Record<string, unknown>) => ({
      home: ((f.teams as Record<string, unknown>)?.home as Record<string, unknown>)?.name,
      away: ((f.teams as Record<string, unknown>)?.away as Record<string, unknown>)?.name,
      status: getStatus(f), goals: f.goals,
    }))))

    for (const fix of finishedFixtures) {
      if (await upsertMatch(supabase, fix, 'finished')) updatedFinished++
    }

    return json({ ok: true, updatedLive, updatedFinished, apiLive: liveData.response?.length ?? 0, apiFinished: finishedFixtures.length })
  } catch (err) {
    console.error('sync-scores error:', err)
    return json({ error: String(err) }, 500)
  }
})

// ─────────────────────────────────────────────────────────────
async function upsertMatch(
  supabase: ReturnType<typeof createClient>,
  fix: Record<string, unknown>,
  status: 'live' | 'finished',
): Promise<boolean> {
  const teams = fix.teams as { home: { name: string }; away: { name: string } }
  const goals = fix.goals as { home: number | null; away: number | null }
  const score = fix.score as { penalty: { home: number | null; away: number | null } }

  if (goals?.home === null || goals?.home === undefined) return false
  if (goals?.away === null || goals?.away === undefined) return false

  // Quita sufijos como " (CBA)", " (LP)", etc.
  const clean = (name: string) => name.replace(/\s*\([^)]*\)/, '').trim()
  const homeSearch = clean(teams.home.name)
  const awaySearch = clean(teams.away.name)

  // Penalty winner
  let penaltyWinner: 'home' | 'away' | null = null
  const penH = score?.penalty?.home
  const penA = score?.penalty?.away
  if (penH !== null && penH !== undefined && penA !== null && penA !== undefined) {
    penaltyWinner = penH > penA ? 'home' : 'away'
  }

  const { data, error } = await supabase
    .from('matches')
    .update({
      home_score: goals.home,
      away_score: goals.away,
      status,
      penalty_winner: penaltyWinner,
    })
    .ilike('home_team', `%${homeSearch}%`)
    .ilike('away_team', `%${awaySearch}%`)
    .eq('competition', COMPETITION)
    .select('id')

  if (error) {
    console.error(`Error actualizando ${teams.home.name} vs ${teams.away.name}:`, error.message)
    return false
  }
  return Array.isArray(data) && data.length > 0
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}
