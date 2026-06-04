import { useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { useGlobalTournament, useUserTournaments } from '../hooks/useTournaments'
import { useAuthStore } from '../store/authStore'
import { useTournamentStore } from '../store/tournamentStore'
import { getStageName, resolveMatches, formatShortDate } from '../lib/utils'
import { ClubFlag } from '../components/ui/ClubFlag'
import type { Match, MatchStage, Prediction, Tournament } from '../types'

const KNOCKOUT_STAGES: MatchStage[] = [
  'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final',
]

// Altura fija por fila del grid (px). Debe ser >= altura de una BracketMatch card.
const ROW_H = 112

// ─── Single team row inside a bracket card ───────────────────
function TeamRow({
  name, score, predScore, isPredWinner, isActualWinner,
}: {
  name: string
  score: number | null
  predScore: number | null
  isPredWinner: boolean
  isActualWinner: boolean
}) {
  const hasPred = predScore !== null
  const finished = score !== null

  return (
    <div className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors ${
      finished && isActualWinner
        ? 'bg-union-blue/20 border border-union-blue/40'
        : 'bg-union-navy-light border border-transparent'
    }`}>
      <div className="flex-shrink-0">
        <ClubFlag teamName={name} size={22} />
      </div>
      <span className={`text-xs font-semibold flex-1 truncate ${
        finished && isActualWinner ? 'text-white' : 'text-white/70'
      }`}>
        {name}
      </span>
      {hasPred && isPredWinner && (
        <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
          finished
            ? isActualWinner
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/15 text-red-400'
            : 'bg-yellow-500/15 text-yellow-400'
        }`} title="Tu pronóstico de clasificado">
          {finished ? (isActualWinner ? '✓' : '✗') : '★'}
        </span>
      )}
      <div className="flex items-center gap-1.5 ml-1 shrink-0">
        {finished && (
          <span className={`text-sm font-bold ${isActualWinner ? 'text-white' : 'text-white/50'}`}>
            {score}
          </span>
        )}
        {hasPred && (
          <span className="text-[11px] text-white/35 tabular-nums">({predScore})</span>
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
    match.penalty_winner === 'home' || match.home_score! > match.away_score!
  )
  const awayWins = finished && (
    match.penalty_winner === 'away' || match.away_score! > match.home_score!
  )

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

  // Navegable si los equipos ya son conocidos (no siguen siendo placeholders)
  const teamsResolved = !match.home_team.startsWith('Gan.') && !match.away_team.startsWith('Gan.')
  const isNavigable = !!tournamentId && teamsResolved

  function handleClick() {
    if (!isNavigable) return
    navigate(`/predicciones?t=${tournamentId}&matchId=${match.id}`)
  }

  return (
    <div
      className={`bg-union-navy border border-union-blue/15 rounded-xl overflow-hidden w-[210px] transition-colors ${
        isNavigable ? 'cursor-pointer hover:border-union-blue/50 hover:bg-union-navy-light/50' : 'opacity-60'
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
        <TeamRow name={match.home_team} score={match.home_score} predScore={predHomeScore} isPredWinner={isPredHomeWinner} isActualWinner={homeWins} />
        <TeamRow name={match.away_team} score={match.away_score} predScore={predAwayScore} isPredWinner={isPredAwayWinner} isActualWinner={awayWins} />
      </div>
      {!finished && teamsResolved && (
        <div className="px-3 pb-2 text-[10px] text-white/25 text-center">{formatShortDate(match.match_date)}</div>
      )}
      {!teamsResolved && (
        <div className="px-3 pb-2 text-[10px] text-white/20 text-center">Por definir</div>
      )}
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

  useEffect(() => {
    const urlT = searchParams.get('t')
    if (urlT) setSelectedTournamentId(urlT)
  }, [searchParams, setSelectedTournamentId])

  const selectedTournament = allTournaments.find((t) => t.id === selectedTournamentId) ?? allTournaments[0] ?? null

  const { data: allMatches, isLoading } = useMatches(selectedTournament?.competition ?? undefined)
  const { data: predictions } = usePredictions(user?.id, selectedTournament?.id ?? '')

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

  const activeStages = KNOCKOUT_STAGES.filter((s) => knockoutMatches[s])
  const baseCount = activeStages.length > 0
    ? Math.max(...activeStages.map((s) => knockoutMatches[s]!.length))
    : 1
  const hasKnockout = activeStages.length > 0

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
          <div className="px-2" style={{ minWidth: 'max-content' }}>

            {/* Stage headers */}
            <div
              className="mb-3"
              style={{
                display: 'grid',
                gridTemplateColumns: activeStages.map(() => '210px').join(' '),
                columnGap: '24px',
              }}
            >
              {activeStages.map((stage) => (
                <h3 key={stage} className="text-xs font-bold text-union-blue uppercase tracking-wider text-center">
                  {getStageName(stage)}
                </h3>
              ))}
            </div>

            {/* Bracket grid — cada match se centra verticalmente en su slot */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: activeStages.map(() => '210px').join(' '),
                gridTemplateRows: `repeat(${baseCount}, ${ROW_H}px)`,
                columnGap: '24px',
              }}
            >
              {activeStages.map((stage, colIdx) => {
                const matches = knockoutMatches[stage]!
                const rowSpan = Math.max(1, Math.round(baseCount / matches.length))
                return matches.map((match, matchIdx) => {
                  const rowStart = matchIdx * rowSpan + 1
                  const rowEnd = rowStart + rowSpan
                  return (
                    <div
                      key={match.id}
                      style={{
                        gridColumn: colIdx + 1,
                        gridRow: `${rowStart} / ${rowEnd}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BracketMatch
                        match={match}
                        prediction={predMap.get(match.id)}
                        tournamentId={selectedTournament?.id}
                      />
                    </div>
                  )
                })
              })}
            </div>

          </div>
        </div>
      )}
    </Layout>
  )
}
