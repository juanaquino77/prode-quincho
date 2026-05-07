import { useMemo, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { useMatches } from '../hooks/useMatches'
import { useGlobalTournament, useUserTournaments } from '../hooks/useTournaments'
import { useAuthStore } from '../store/authStore'
import { getStageName } from '../lib/utils'
import type { Match, MatchStage, Tournament } from '../types'

const KNOCKOUT_STAGES: MatchStage[] = [
  'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final',
]

function TeamBadge({ flag, name, score, winner }: {
  flag: string | null
  name: string
  score: number | null
  winner: boolean
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
      winner ? 'bg-union-blue/20 border border-union-blue/40' : 'bg-union-navy-light border border-transparent'
    }`}>
      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
        {flag && flag.startsWith('http') ? (
          <img src={flag} alt={name} className="w-6 h-6 object-contain" />
        ) : (
          <span className="text-base">{flag ?? '⚽'}</span>
        )}
      </div>
      <span className={`text-xs font-semibold flex-1 truncate ${winner ? 'text-white' : 'text-white/70'}`}>
        {name}
      </span>
      {score !== null && (
        <span className={`text-sm font-bold ml-1 ${winner ? 'text-white' : 'text-white/50'}`}>
          {score}
        </span>
      )}
    </div>
  )
}

function BracketMatch({ match }: { match: Match }) {
  const homeWins = match.home_score !== null && match.away_score !== null && (
    match.penalty_winner === 'home' || match.home_score > match.away_score
  )
  const awayWins = match.home_score !== null && match.away_score !== null && (
    match.penalty_winner === 'away' || match.away_score > match.home_score
  )

  return (
    <div className="bg-union-navy border border-union-blue/15 rounded-xl overflow-hidden min-w-[180px]">
      <div className="px-2 py-1 border-b border-union-blue/10">
        <span className="text-[10px] text-white/30 font-medium">{match.venue ?? '—'}</span>
      </div>
      <div className="p-1.5 space-y-1">
        <TeamBadge flag={match.home_flag} name={match.home_team} score={match.home_score} winner={homeWins} />
        <TeamBadge flag={match.away_flag} name={match.away_team} score={match.away_score} winner={awayWins} />
      </div>
      {match.penalty_winner && (
        <div className="px-3 pb-2 text-[10px] text-yellow-400 text-center">
          Pen: {match.penalty_winner === 'home' ? match.home_team : match.away_team}
        </div>
      )}
      {match.status === 'upcoming' && (
        <div className="px-3 pb-2 text-[10px] text-white/30 text-center">Próximo</div>
      )}
    </div>
  )
}

function BracketStage({ stage, matches }: { stage: MatchStage; matches: Match[] }) {
  if (matches.length === 0) return null
  return (
    <div className="flex flex-col items-center gap-2 min-w-[200px]">
      <h3 className="text-xs font-bold text-union-blue uppercase tracking-wider mb-1">
        {getStageName(stage)}
      </h3>
      <div className="flex flex-col gap-3">
        {matches.map((m) => (
          <BracketMatch key={m.id} match={m} />
        ))}
      </div>
    </div>
  )
}

export default function Bracket() {
  const { user } = useAuthStore()
  const { data: globalTournament } = useGlobalTournament()
  const { data: myTournaments } = useUserTournaments(user?.id)

  const allTournaments = useMemo<Tournament[]>(() => {
    const list: Tournament[] = []
    if (globalTournament) list.push(globalTournament)
    const friends = (myTournaments ?? []).filter((t) => t.type === 'friends')
    return [...list, ...friends]
  }, [globalTournament, myTournaments])

  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null)
  const selectedTournament = allTournaments.find((t) => t.id === selectedTournamentId) ?? allTournaments[0] ?? null

  const { data: allMatches, isLoading } = useMatches(selectedTournament?.competition ?? undefined)

  const knockoutMatches = useMemo(() => {
    const matches = allMatches ?? []
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
        <h1 className="text-2xl font-bold text-white">Bracket</h1>
        <p className="text-white/50 text-sm mt-0.5">Llave de la fase eliminatoria</p>
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

      {isLoading ? (
        <div className="text-center py-20 text-white/40">Cargando bracket...</div>
      ) : !hasKnockout ? (
        <div className="text-center py-20 text-white/40">
          <p className="text-4xl mb-3">🏆</p>
          <p>Aún no hay partidos eliminatorios en esta competencia</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-8 items-start min-w-max px-2 py-2">
            {KNOCKOUT_STAGES.map((stage) => {
              const matches = knockoutMatches[stage]
              if (!matches) return null
              return <BracketStage key={stage} stage={stage} matches={matches} />
            })}
          </div>
        </div>
      )}
    </Layout>
  )
}
