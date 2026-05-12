import { createClient } from 'jsr:@supabase/supabase-js@2'

const RESEND_API = 'https://api.resend.com/emails'
const CHECK_WINDOW_MINUTES = 15

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-reminder-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  // Auth: acepta el service role key (pg_cron) o el reminder secret
  const auth            = req.headers.get('Authorization') ?? ''
  const reminderSecret  = req.headers.get('x-reminder-secret') ?? ''
  const serviceKey      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const configSecret    = Deno.env.get('REMINDER_SECRET') ?? ''

  const ok = auth === `Bearer ${serviceKey}` || (configSecret && reminderSecret === configSecret)
  if (!ok) return json({ error: 'No autorizado' }, 401)

  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return json({ error: 'RESEND_API_KEY no configurada' }, 500)

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey)

  // Modo force: envía anuncio a todos los miembros de torneos activos
  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
  if (body.force) {
    const { data: { users: allUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const emailMap = new Map<string, string>(allUsers.map((u) => [u.id, u.email ?? '']))

    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('is_active', true)

    let totalSent = 0
    for (const tournament of tournaments ?? []) {
      const { data: members } = await supabase
        .from('tournament_members')
        .select('user_id')
        .eq('tournament_id', tournament.id)

      for (const member of members ?? []) {
        const email = emailMap.get(member.user_id)
        if (!email) continue

        await fetch(RESEND_API, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Prode Quincho <noreply@prodequincho.com>',
            to: email,
            subject: `⚽ ¡Los Cuartos de Final ya están disponibles! – ${tournament.name}`,
            html: buildAnnouncementHtml(tournament.name),
          }),
        })
        totalSent++
      }
    }
    return json({ ok: true, totalSent })
  }

  // Fetch de todos los emails de una vez para no repetir la llamada
  const { data: { users: allUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = new Map<string, string>(
    allUsers.map((u) => [u.id, u.email ?? ''])
  )

  // Torneos activos con sus horas de cierre
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name, competition, prediction_lock_hours')
    .eq('is_active', true)

  const now = new Date()
  let totalSent = 0

  for (const tournament of tournaments ?? []) {
    const lockHours = (tournament.prediction_lock_hours as number) ?? 0

    // Ventana: partidos cuyo primer kick-off de la ronda cae en
    // [ahora + lockHours - 15min, ahora + lockHours]
    const windowStart = new Date(now.getTime() + (lockHours - CHECK_WINDOW_MINUTES / 60) * 3600_000)
    const windowEnd   = new Date(now.getTime() + lockHours * 3600_000)

    // Partidos próximos en esa ventana para esta competencia
    const { data: windowMatches } = await supabase
      .from('matches')
      .select('id, stage, group_name, match_date')
      .eq('competition', tournament.competition)
      .eq('status', 'upcoming')
      .gte('match_date', windowStart.toISOString())
      .lte('match_date', windowEnd.toISOString())
      .order('match_date', { ascending: true })

    if (!windowMatches?.length) continue

    // Agrupar por ronda (stage + group_name)
    const rounds = new Map<string, string[]>()
    for (const m of windowMatches) {
      const key = `${m.stage}:${m.group_name ?? ''}`
      if (!rounds.has(key)) rounds.set(key, [])
      rounds.get(key)!.push(m.id)
    }

    for (const [roundKey, _] of rounds) {
      const [stage, groupName] = roundKey.split(':')

      const { data: allRoundMatches } = await supabase
        .from('matches')
        .select('id')
        .eq('competition', tournament.competition)
        .eq('stage', stage)
        .eq('status', 'upcoming')
        .then((res) => {
          if (groupName) {
            return supabase
              .from('matches')
              .select('id')
              .eq('competition', tournament.competition)
              .eq('stage', stage)
              .eq('group_name', groupName)
              .eq('status', 'upcoming')
          }
          return res
        })

      const matchIds = (allRoundMatches ?? []).map((m) => m.id)
      if (!matchIds.length) continue

      const { data: members } = await supabase
        .from('tournament_members')
        .select('user_id')
        .eq('tournament_id', tournament.id)

      for (const member of members ?? []) {
        const { count } = await supabase
          .from('predictions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', member.user_id)
          .eq('tournament_id', tournament.id)
          .in('match_id', matchIds)

        if ((count ?? 0) > 0) continue

        const logKey = `${tournament.id}:${roundKey}`
        const { error: logErr } = await supabase
          .from('reminder_logs')
          .insert({ tournament_id: tournament.id, user_id: member.user_id, round_key: logKey })

        if (logErr) continue

        const email = emailMap.get(member.user_id)
        if (!email) continue

        const stageName = stageLabel(stage)

        await fetch(RESEND_API, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Prode Quincho <noreply@prodequincho.com>',
            to: email,
            subject: `⚽ ¡Los partidos están por comenzar! – ${tournament.name}`,
            html: buildEmailHtml(tournament.name, stageName),
          }),
        })
        totalSent++
      }
    }
  }

  return json({ ok: true, totalSent })
})

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    group: 'Fase de Grupos',
    round_of_32: 'Ronda de 32',
    round_of_16: 'Octavos de Final',
    quarterfinal: 'Cuartos de Final',
    semifinal: 'Semifinal',
    third_place: 'Tercer Puesto',
    final: 'Final',
  }
  return map[stage] ?? stage
}

function buildEmailHtml(tournamentName: string, stageName: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:28px;"><span style="font-size:48px;">⚽</span></div>
    <div style="background:#0d1f3c;border:1px solid rgba(0,168,222,0.2);border-radius:16px;padding:28px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">¡Los partidos están por comenzar!</h1>
      <p style="margin:0 0 20px;font-size:14px;color:rgba(255,255,255,0.5);">${stageName} · ${tournamentName}</p>
      <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.8);line-height:1.6;">
        Todavía no cargaste tus pronósticos para esta jornada. Entrá ahora antes de que empiece el primer partido.
      </p>
      <div style="text-align:center;">
        <a href="https://prodequincho.com/predicciones" style="display:inline-block;background:#00a8de;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;">
          Cargar pronósticos →
        </a>
      </div>
    </div>
    <p style="margin-top:20px;text-align:center;font-size:11px;color:rgba(255,255,255,0.2);">Prode Quincho · Club Unión</p>
  </div>
</body>
</html>`
}

function buildAnnouncementHtml(tournamentName: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:28px;"><span style="font-size:48px;">🏆</span></div>
    <div style="background:#0d1f3c;border:1px solid rgba(0,168,222,0.2);border-radius:16px;padding:28px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">¡Los Cuartos de Final ya están disponibles!</h1>
      <p style="margin:0 0 20px;font-size:14px;color:rgba(255,255,255,0.5);">${tournamentName}</p>
      <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.8);line-height:1.6;">
        Ya podés cargar tus pronósticos para los Cuartos de Final del Apertura 2026. ¡No te quedes afuera!
      </p>
      <div style="text-align:center;">
        <a href="https://prodequincho.com/predicciones" style="display:inline-block;background:#00a8de;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;">
          Cargar pronósticos →
        </a>
      </div>
    </div>
    <p style="margin-top:20px;text-align:center;font-size:11px;color:rgba(255,255,255,0.2);">Prode Quincho · Club Unión</p>
  </div>
</body>
</html>`
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}
