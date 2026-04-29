import { Link } from 'react-router-dom'
import { Trophy, Calendar, Users, Star, ArrowRight, Lock } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'
import { useMatches } from '../hooks/useMatches'
import { useGlobalTournament, useLeaderboard } from '../hooks/useTournaments'
import { formatShortDate } from '../lib/utils'

export default function Dashboard() {
  const { user, profile } = useAuthStore()
  const { data: matches } = useMatches()
  const { data: globalTournament } = useGlobalTournament()
  const { data: leaderboard } = useLeaderboard(globalTournament?.id)

  const upcoming = matches?.filter((m) => m.status === 'upcoming').slice(0, 3) ?? []
  const live = matches?.filter((m) => m.status === 'live') ?? []
  const top3 = leaderboard?.slice(0, 3) ?? []
  const myRank = leaderboard?.find((e) => e.user_id === user?.id)

  return (
    <Layout>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          ¡Hola, {profile?.username ?? 'jugador'}! 👋
        </h1>
        <p className="text-white/50 mt-0.5">Mundial 2026 · Club Unión de Mar del Plata</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Calendar size={20} />} label="Próximos" value={upcoming.length.toString()} />
        <StatCard icon={<Star size={20} />} label="En vivo" value={live.length.toString()} highlight={live.length > 0} />
        <StatCard icon={<Trophy size={20} />} label="Mi posición" value={myRank ? `#${myRank.rank}` : '—'} />
        <StatCard icon={<Users size={20} />} label="Mis puntos" value={myRank ? myRank.total_points.toString() : '0'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Live / Upcoming matches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">
              {live.length > 0 ? '🔴 En vivo' : '📅 Próximos partidos'}
            </h2>
            <Link to="/predicciones" className="text-sm text-union-blue hover:text-union-blue-light flex items-center gap-1">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {upcoming.length === 0 && live.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-white/40 text-sm">No hay partidos próximos</p>
              </Card>
            ) : (
              (live.length > 0 ? live : upcoming).map((match) => (
                <Card key={match.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{match.home_flag ?? '🏳️'}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{match.home_team} vs {match.away_team}</p>
                      <p className="text-xs text-white/40">{formatShortDate(match.match_date)}</p>
                    </div>
                    <span className="text-xl">{match.away_flag ?? '🏳️'}</span>
                  </div>
                  {match.status === 'live' ? (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">En vivo</span>
                  ) : (
                    <Lock size={14} className="text-white/20" />
                  )}
                </Card>
              ))
            )}
          </div>
          <Link to="/predicciones">
            <Button variant="secondary" className="w-full mt-3">Hacer mis pronósticos</Button>
          </Link>
        </div>

        {/* Top 3 leaderboard */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">🏆 Tabla general</h2>
            <Link to="/tabla" className="text-sm text-union-blue hover:text-union-blue-light flex items-center gap-1">
              Ver completa <ArrowRight size={14} />
            </Link>
          </div>
          <Card>
            {top3.length === 0 ? (
              <p className="text-center text-white/40 text-sm py-6">Aún no hay pronósticos</p>
            ) : (
              <div className="space-y-3">
                {top3.map((entry, i) => (
                  <div key={entry.user_id} className="flex items-center gap-3">
                    <span className="text-xl w-7 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{entry.username}</p>
                    </div>
                    <span className="text-lg font-bold text-union-blue">{entry.total_points} pts</span>
                  </div>
                ))}
              </div>
            )}
            {myRank && myRank.rank > 3 && (
              <div className="mt-4 pt-4 border-t border-union-blue/10 flex items-center gap-3">
                <span className="text-sm text-white/40 w-7 text-center">#{myRank.rank}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-union-blue">{myRank.username} (vos)</p>
                </div>
                <span className="text-lg font-bold text-union-blue">{myRank.total_points} pts</span>
              </div>
            )}
          </Card>
          <Link to="/torneos">
            <Button variant="secondary" className="w-full mt-3">Torneos de amigos</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <Card className={highlight ? 'border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : ''}>
      <div className="flex items-center gap-2 text-union-blue/70 mb-1">{icon}<span className="text-xs font-medium text-white/50">{label}</span></div>
      <p className={`text-2xl font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</p>
    </Card>
  )
}
