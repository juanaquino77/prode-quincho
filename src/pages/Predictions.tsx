import { useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { MatchCard } from '../components/matches/MatchCard'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { useGlobalTournament } from '../hooks/useTournaments'
import { useAuthStore } from '../store/authStore'
import { getStageName } from '../lib/utils'
import type { Match } from '../types'

const STAGES = ['group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function Predictions() {
  const { user } = useAuthStore()
  const { data: matches, isLoading } = useMatches()
  const { data: globalTournament } = useGlobalTournament()
  const { data: predictions } = usePredictions(user?.id, globalTournament?.id ?? '')
  const [activeGroup, setActiveGroup] = useState<string>('A')
  const [activeStage, setActiveStage] = useState<string>('group')

  const predMap = new Map(predictions?.map((p) => [p.match_id, p]))

  const filteredMatches = (matches ?? []).filter((m) => {
    if (activeStage === 'group') return m.stage === 'group' && m.group_name === activeGroup
    return m.stage === activeStage
  })

  if (!globalTournament) {
    return (
      <Layout>
        <div className="text-center py-20 text-white/40">
          Cargando torneo global...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mis Pronósticos</h1>
        <p className="text-white/50 text-sm mt-0.5">Ingresá tu resultado esperado antes de cada partido</p>
      </div>

      {/* Stage tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => { setActiveStage(stage); if (stage === 'group') setActiveGroup('A') }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeStage === stage ? 'bg-union-blue text-white' : 'bg-union-navy-light text-white/50 hover:text-white'
            }`}
          >
            {getStageName(stage)}
          </button>
        ))}
      </div>

      {/* Group tabs (only in group stage) */}
      {activeStage === 'group' && (
        <div className="flex gap-1 mb-4 flex-wrap">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                activeGroup === g ? 'bg-union-blue text-white' : 'bg-union-navy-light text-white/40 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-white/40">Cargando partidos...</div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-12 text-white/40">No hay partidos en esta etapa</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match: Match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predMap.get(match.id)}
              tournamentId={globalTournament.id}
              userId={user!.id}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}
