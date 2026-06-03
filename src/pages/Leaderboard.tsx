import { useMemo } from 'react'
import { Layout } from '../components/layout/Layout'
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable'
import { useGlobalTournament, useUserTournaments, useLeaderboard } from '../hooks/useTournaments'
import { useMatches } from '../hooks/useMatches'
import { useAuthStore } from '../store/authStore'
import { useTournamentStore } from '../store/tournamentStore'
import { DEFAULT_RULES } from '../types'
import type { Tournament } from '../types'

export default function Leaderboard() {
  const { user, profile } = useAuthStore()
  const { data: globalTournament } = useGlobalTournament()
  const { data: myTournaments } = useUserTournaments(user?.id)
  const { selectedTournamentId, setSelectedTournamentId } = useTournamentStore()

  const tournamentId = selectedTournamentId ?? globalTournament?.id

  const selectedTournament = [...(globalTournament ? [globalTournament] : []), ...(myTournaments ?? [])]
    .find((t) => t.id === tournamentId)

  const { data: matches } = useMatches(selectedTournament?.competition ?? undefined)
  const hasLive = useMemo(() => (matches ?? []).some((m) => m.status === 'live'), [matches])

  const { data: leaderboard, isLoading, dataUpdatedAt } = useLeaderboard(tournamentId, hasLive)

  const allTournaments: Tournament[] = [
    ...(globalTournament ? [globalTournament] : []),
    ...(myTournaments?.filter((t) => t.type === 'friends') ?? []),
  ]

  const rules = selectedTournament?.rules ?? DEFAULT_RULES

  const rulesSubtitle = [
    `${rules.pts_outcome} pt resultado`,
    `${rules.pts_exact} pts exacto`,
    rules.pts_penalty_correct > 0 && `+${rules.pts_penalty_correct} pt penales`,
  ].filter(Boolean).join(' · ')

  const updatedAt = hasLive && dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tabla de Posiciones</h1>
            <p className="text-white/50 text-sm mt-0.5">{rulesSubtitle}</p>
          </div>
          {hasLive && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">EN VIVO</span>
              {updatedAt && <span className="text-xs text-white/30">{updatedAt}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Tournament selector */}
      {allTournaments.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {allTournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTournamentId(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tournamentId === t.id
                  ? 'bg-union-blue text-white'
                  : 'bg-union-navy-light text-white/50 hover:text-white'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-white/40">Cargando tabla...</div>
      ) : (
        <LeaderboardTable
          entries={leaderboard ?? []}
          currentUserId={user?.id}
          isAdmin={profile?.is_admin ?? false}
          tournamentId={tournamentId}
          competition={selectedTournament?.competition}
          showRivalPredictions={selectedTournament?.show_rival_predictions}
          hasCorazonada={selectedTournament?.has_corazonada ?? false}
        />
      )}
    </Layout>
  )
}
