import { useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { useGlobalTournament, useUserTournaments } from '../hooks/useTournaments'
import { useAuthStore } from '../store/authStore'
import { useTournamentStore } from '../store/tournamentStore'
import { getStageName } from '../lib/utils'
import { ClubFlag } from '../components/ui/ClubFlag'
import type { Match, MatchStage, Prediction, Tournament } from '../types'

const KNOCKOUT_STAGES: MatchStage[] = [
  'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final',
]

// Resuelve placeholders "Gan. X o Y" usando los ganadores reales de partidos terminados
function resolveTeamName(name: string, allMatches: Match[]): string {
  const m = name.match(/^Gan\.\s+(.+?)\s+o\s+(.+)$/)
  if (!m) return name
  const [, partA, partB] = m
  const feeder = allMatches.find(
    (pm) =>
      pm.home_score !== null &&
      pm.away_score !== null &&
      (pm.home_team.includes(partA) || pm.away_team.includes(partA)) &&
      (pm.home_team.includes(partB) || pm.away_team.includes(partB))
  )
  if (!feeder) return name
  const homeWins =
    feeder.penalty_winner === 'home' || feeder.home_score! > feeder.away_score!
  return homeWins ? feeder.home_team : feeder.away_team
}

function resolveMatches(matches: Match[]): Match[] {
  return matches.map((m) => ({
    ...m,
    home_team: resolveTeamName(m.home_team, matches),
    away_team: resolveTeamName(m.away_team, matches),
  }))
}

// ─── Single team row inside a bracket card ───────────────────
function TeamRow({
  name,
  score,
  predScore,
  isPredWinner,
  isActualWinner,
}: {
  name: string
  score: number | null
  predScore: number | null
  isPredWinner: boolean    // user predicted this team wins
  isActualWinner: boolean  // this team actually won
}) {
  const hasPred = predScore !== null
  const finished = score !== null

  return (
    <div className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors ${
      finished && isActualWinner
        ? 'bg-union-blue/20 border border-union-blue/40'
        : 'bg-union-navy-light border border-transparent'
    }`}>
      {/* Club flag */}
      <div className="flex-shrink-0">
        <ClubFlag teamName={name} size={22} />
      </div>

      {/* Name */}
      <span className={`text-xs font-semibold flex-1 truncate ${
        finished && isActualWinner ? 'text-white' : 'text-white/70'
      }`}>
        {name}
      </span>

      {/* Predicted winner chevron */}
      {hasPred && isPredWinner && (
        <span
          className={`text-[10px] font-bold px-1 py-0.5 rounded ${
            finished
              ? isActualWinner
                ? 'bg-green-500/20 text-green-400'   // predicted correctly ✓
                : 'bg-red-500/15 text-red-400'        // predicted wrong ✗
              : 'bg-yellow-500/15 text-yellow-400'    // pending prediction ★
          }`}
          title="Tu pronóstico de clasificado"
        >
          {finished ? (isActualWinner ? '✓' : '✗') : '★'}
        </span>
      )}

      {/* Scores: actual | pred */}
      <div className="flex items-center gap-1.5 ml-1 shrink-0">
        {finished && (
          <span className={`text-sm font-bold ${isActualWinner ? 'text-white' : 'text-white/50'}`}>
            {score}
          </span>
        )}
        {hasPred && (
          <span className="text-[11px] text-white/35 tabular-nums">
            ({predScore})
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Single match card in the bracket ────────────────────────
function BracketMatch({ match, prediction, tournamentId }: {
  match: Match
  prediction?: Prediction
  tournamentId?: string
}) {
  const navigate = useNavigate()
  const finished = match.home_score !== null && match.away_score !== null

  const homeWins = finished && (
    match.penalty_winner === 'home' || (match.home_score! > match.away_score!)
  )
  const awayWins = finished && (
    match.penalty_winner === 'away' || (match.away_score! > match.home_score!)
  )

  // Who did the user predict wins?
  const predHomeScore = prediction?.home_score_pred ?? null
  const predAwayScore = prediction?.away_score_pred ?? null
  const predPenalty   = prediction?.penalty_pred ?? null

  let isPredHomeWinner = false
  let isPredAwayWinner = false

  if (predHomeScore !== null && predAwayScore !== null) {
    if (predHomeScore > predAwayScore) isPredHomeWinner = true
    else if (predAwayScore > predHomeScore) isPredAwayWinner = true
    else if (predPenalty === 'home') isPredHomeWinner = true
    else if (predPenalty === 'away') isPredAwayWinner = true
  }

  function handleClick() {
    if (!finished || !tournamentId) return
    navigate(`/predicciones?t=${tournamentId}&matchId=${match.id}`)
  }

  return (
    <div
      className={`bg-union-navy border border-union-blue/15 rounded-xl overflow-hidden min-w-[195px] max-w-[230px] transition-colors ${
        finished && tournamentId ? 'cursor-pointer hover:border-union-blue/50 hover:bg-union-navy-light/50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="px-3 py-1 border-b border-union-blue/10 flex items-center justify-between">
        <span className="text-[10px] text-white/25 font-medium truncate">{match.venue ?? '—'}</span>
        {finished && match.penalty_winner && (
          <span className="text-[9px] text-yellow-400 font-semibold ml-1 shrink-0">PEN</span>
        )}
      </div>
      <div className="p-1.5 space-y-1">
        <TeamRow
          name={match.home_team}
          score={match.home_score}
          predScore={predHomeScore}
          isPredWinner={isPredHomeWinner}
          isActualWinner={homeWins}
        />
        <TeamRow
          name={match.away_team}
          score={match.away_score}
          predScore={predAwayScore}
          isPredWinner={isPredAwayWinner}
          isActualWinner={awayWins}
        />
      </div>
      {!finished && (
        <div className="px-3 pb-2 text-[10px] text-white/25 text-center">Próximo</div>
      )}
    </div>
  )
}

// ─── Column for one stage ─────────────────────────────────────
function BracketStage({
  stage, matches, predMap, tournamentId,
}: {
  stage: MatchStage
  matches: Match[]
  predMap: Map<string, Prediction>
  tournamentId?: string
}) {
  if (matches.length === 0) return null
  return (
    <div className="flex flex-col items-center gap-2 min-w-[210px]">
      <h3 className="text-xs font-bold text-union-blue uppercase tracking-wider mb-1">
        {getStageName(stage)}
      </h3>
      <div className="flex flex-col gap-4">
        {matches.map((m) => (
          <BracketMatch key={m.id} match={m} prediction={predMap.get(m.id)} tournamentId={tournamentId} />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────
export default function Bracket() {
  const { user } = useAuthStore()
  const { data: globalTournament } = useGlobalTournament()
  const { data: myTournaments } = useUserTournaments(user?.id)
  const { selectedTournamentId, setSelectedTournamentId } = useTournamentStore()
  const [searchParams] = useSearchParams()

  const allTournaments = useMemo<Tournament[]>(() => {
    const list: Tournament[] = []
    if (globalTournament) list.push(globalTournament)
    const friends = (myTournaments ?? []).filter((t) => t.type === 'friends')
    return [...list, ...friends]
  }, [globalTournament, myTournaments])

  // URL param ?t= takes priority on first load
  useEffect(() => {
    const urlT = searchParams.get('t')
    if (urlT) setSelectedTournamentId(urlT)
  }, [searchParams, setSelectedTournamentId])

  const selectedTournament = allTournaments.find((t) => t.id === selectedTournamentId) ?? allTournaments[0] ?? null

  const { data: allMatches, isLoading } = useMatches(selectedTournament?.competition ?? undefined)
  const { data: predictions } = usePredictions(user?.id, selectedTournament?.id ?? '')

  // Map match_id → prediction for fast lookup
  const predMap = useMemo(
    () => new Map((predictions ?? []).map((p) => [p.match_id, p])),
    [predictions]
  )

  const knockoutMatches = useMemo(() => {
    const matches = resolveMatches(allMatches ?? [])
    const byStage: Partial<Record<MatchStage, Match[]>> = {}
    for (const stage of KNOCKOUT_STAGES) {
      const ms = matches.filter((m) => m.stage === stage)
      if (ms.length > 0) byStage[stage] = ms
    }
    return byStage
  }, [allMatches])

  const hasKnockout = Object.keys(knockoutMatches).length > 0

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Llave</h1>
        <p className="text-white/50 text-sm mt-0.5">Fase eliminatoria · tus predicciones en (paréntesis)</p>
      </div>

      {/* Tournament selector */}
      {allTournaments.length > 1 && (
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {allTournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTournamentId(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTournament?.id === t.id
                  ? 'bg-union-blue text-white'
                  : 'bg-union-navy-light text-white/50 hover:text-white'
              }`}
            >
              {t.type === 'global' ? '🌐 ' : '👥 '}
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mb-4 text-[11px] text-white/40">
        <span><span className="text-yellow-400 font-bold">★</span> Tu pronóstico de clasificado</span>
        <span><span className="text-green-400 font-bold">✓</span> Acertaste</span>
        <span><span className="text-red-400 font-bold">✗</span> Fallaste</span>
        <span className="text-white/25">(X) = tu predicción de goles</span>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-white/40">Cargando llave...</div>
      ) : !hasKnockout ? (
        <div className="text-center py-20 text-white/40">
          <p className="text-4xl mb-3">🏆</p>
          <p>Aún no hay partidos eliminatorios en esta competencia</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 items-start min-w-max px-2 py-2">
            {KNOCKOUT_STAGES.map((stage) => {
              const matches = knockoutMatches[stage]
              if (!matches) return null
              return (
                <BracketStage key={stage} stage={stage} matches={matches} predMap={predMap} tournamentId={selectedTournament?.id} />
              )
            })}
          </div>
        </div>
      )}
    </Layout>
  )
}
