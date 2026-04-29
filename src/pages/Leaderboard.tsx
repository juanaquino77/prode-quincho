import { useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable'
import { useGlobalTournament, useUserTournaments, useLeaderboard } from '../hooks/useTournaments'
import { useAuthStore } from '../store/authStore'
import type { Tournament } from '../types'

export default function Leaderboard() {
  const { user } = useAuthStore()
  const { data: globalTournament } = useGlobalTournament()
  const { data: myTournaments } = useUserTournaments(user?.id)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const tournamentId = selectedId ?? globalTournament?.id
  const { data: leaderboard, isLoading } = useLeaderboard(tournamentId)

  const allTournaments: Tournament[] = [
    ...(globalTournament ? [globalTournament] : []),
    ...(myTournaments?.filter((t) => t.type === 'friends') ?? []),
  ]

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Tabla de Posiciones</h1>
        <p className="text-white/50 text-sm mt-0.5">
          1 punto por resultado · 2 puntos por marcador exacto
        </p>
      </div>

      {/* Tournament selector */}
      {allTournaments.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {allTournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
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
        <LeaderboardTable entries={leaderboard ?? []} currentUserId={user?.id} />
      )}
    </Layout>
  )
}
