import { useState, useMemo } from 'react'
import { Layout } from '../components/layout/Layout'
import { MatchCard } from '../components/matches/MatchCard'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { useGlobalTournament, useUserTournaments } from '../hooks/useTournaments'
import { useAuthStore } from '../store/authStore'
import { getStageName } from '../lib/utils'
import type { Match, MatchStage, Tournament } from '../types'

const STAGE_ORDER: MatchStage[] = ['group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function Predictions() {
  const { user } = useAuthStore()
  const { data: globalTournament } = useGlobalTournament()
  const { data: myTournaments } = useUserTournaments(user?.id)

  // Build combined tournament list: global first, then user's friend tournaments
  const allTournaments = useMemo<Tournament[]>(() => {
    const list: Tournament[] = []
    if (globalTournament) list.push(globalTournament)
    const friends = (myTournaments ?? []).filter((t) => t.type === 'friends')
    return [...list, ...friends]
  }, [globalTournament, myTournaments])

  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null)

  // Resolve the active tournament object
  const selectedTournament =
    allTournaments.find((t) => t.id === selectedTournamentId) ?? allTournaments[0] ?? null

  // Filter matches by the tournament's competition (null = all matches except apertura)
  const competitionFilter = selectedTournament?.competition ?? undefined

  const { data: matches, isLoading } = useMatches(competitionFilter)
  const { data: predictions } = usePredictions(user?.id, selectedTournament?.id ?? '')

  // Derive available stages from the loaded matches
  const availableStages = useMemo(() => {
    const stageSet = new Set((matches ?? []).map((m) => m.stage))
    return STAGE_ORDER.filter((s) => stageSet.has(s))
  }, [matches])

  const [activeStage, setActiveStage] = useState<MatchStage>('group')
  const [activeGroup, setActiveGroup] = useState<string>('A')

  // Use first available stage if current activeStage doesn't exist in this competition
  const resolvedStage = availableStages.includes(activeStage)
    ? activeStage
    : availableStages[0] ?? 'group'

  const predMap = new Map(predictions?.map((p) => [p.match_id, p]))

  const filteredMatches = (matches ?? []).filter((m: Match) => {
    if (resolvedStage === 'group') return m.stage === 'group' && m.group_name === activeGroup
    return m.stage === resolvedStage
  })

  const showStageTabs = availableStages.length > 1
  const showGroupTabs = resolvedStage === 'group'

  if (!selectedTournament && allTournaments.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20 text-white/40">Cargando torneos...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Mis Pronósticos</h1>
        <p className="text-white/50 text-sm mt-0.5">Ingresá tu resultado esperado antes de cada partido</p>
      </div>

      {/* Tournament selector */}
      {allTournaments.length > 1 && (
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {allTournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTournamentId(t.id)
                setActiveStage('group')
                setActiveGroup('A')
              }}
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

      {/* Stage tabs (only when multiple stages available) */}
      {showStageTabs && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {availableStages.map((stage) => (
            <button
              key={stage}
              onClick={() => { setActiveStage(stage); if (stage === 'group') setActiveGroup('A') }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                resolvedStage === stage ? 'bg-union-blue text-white' : 'bg-union-navy-light text-white/50 hover:text-white'
              }`}
            >
              {getStageName(stage)}
            </button>
          ))}
        </div>
      )}

      {/* Group tabs (only in group stage) */}
      {showGroupTabs && (
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
              tournamentId={selectedTournament!.id}
              userId={user!.id}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}
