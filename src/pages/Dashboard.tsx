import { Link } from 'react-router-dom'
import { Trophy, Calendar, Users, Star, ArrowRight, Lock, AlertCircle } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'
import { useMatches } from '../hooks/useMatches'
import { useGlobalTournament, useUserTournaments, useLeaderboard } from '../hooks/useTournaments'
import { useSpecialPredictions, } from '../hooks/useSpecialPredictions'
import { usePredictionCompletion } from '../hooks/usePredictions'
import { useTournamentStore } from '../store/tournamentStore'
import { formatShortDate, resolveMatches, cn } from '../lib/utils'
import { ClubFlag } from '../components/ui/ClubFlag'

// Muestra el emoji de bandera de país, o el escudo del club como fallback
function MatchFlag({ flag, teamName, size }: { flag: string | null; teamName: string; size: number }) {
  if (flag) {
    return (
      <span
        className="shrink-0 flex items-center justify-center"
        style={{ width: size, height: size, fontSize: size * 0.72, lineHeight: 1 }}
        aria-label={teamName}
      >
        {flag}
      </span>
    )
  }
  return <ClubFlag teamName={teamName} size={size} className="shrink-0" />
}

export default function Dashboard() {
  const { user, profile } = useAuthStore()
  const { data: allMatches } = useMatches()
  const { data: globalTournament } = useGlobalTournament()
  const { data: myTournaments } = useUserTournaments(user?.id)
  const { selectedTournamentId } = useTournamentStore()

  // Usa el torneo seleccionado por el usuario; si no hay, cae al global
  const activeTournamentId = selectedTournamentId
    ?? myTournaments?.find((t) => t.type === 'friends')?.id
    ?? globalTournament?.id

  const activeTournament = [...(globalTournament ? [globalTournament] : []), ...(myTournaments ?? [])]
    .find((t) => t.id === activeTournamentId)

  // Solo mostrar partidos de competiciones en las que el usuario está inscripto.
  // El torneo global (Mundial) se incluye siempre; los de amigos solo si el usuario pertenece.
  const userCompetitions = new Set<string>([
    ...(globalTournament?.competition ? [globalTournament.competition] : []),
    ...(myTournaments ?? []).map((t) => t.competition).filter(Boolean) as string[],
  ])
  const matches = resolveMatches(
    userCompetitions.size > 0
      ? (allMatches ?? []).filter((m) => userCompetitions.has(m.competition))
      : (allMatches ?? [])
  )

  const hasLive = matches.some((m) => m.status === 'live')
  const { data: leaderboard } = useLeaderboard(activeTournamentId, hasLive)

  const { total: predTotal, filled: predFilled, isComplete: predComplete, pct: predPct } =
    usePredictionCompletion(user?.id, activeTournamentId ?? '', activeTournament?.competition ?? null)

  const hasSpecial = globalTournament?.has_special_predictions ?? false
  const { data: specialPred } = useSpecialPredictions(
    hasSpecial ? user?.id : undefined,
    hasSpecial ? globalTournament?.id : undefined,
  )
  const specialNotFilled = hasSpecial && specialPred !== undefined &&
    !(specialPred?.champion_team && specialPred?.top_scorer && specialPred?.best_player)
  const SPECIAL_LOCK = new Date('2026-06-11T23:00:00Z')
  const specialStillOpen = new Date() < SPECIAL_LOCK

  const upcoming = matches.filter((m) => m.status === 'upcoming').slice(0, 3)
  const live = matches.filter((m) => m.status === 'live')
  const top3 = leaderboard?.slice(0, 3) ?? []
  const myRank = leaderboard?.find((e) => e.user_id === user?.id)

  return (
    <Layout>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          ¡Hola, {profile?.username ?? 'jugador'}! 👋
        </h1>
        <p className="text-white/50 mt-0.5">Mundial 2026 · El Quincho</p>
      </div>

      {/* Prize pool banner */}
      {globalTournament && (globalTournament.entry_fee ?? 0) > 0 && (
        <Link to="/torneos">
          <div className="mb-5 flex items-center gap-3 bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/25 rounded-xl px-4 py-3 hover:from-yellow-500/15 hover:to-amber-600/15 transition-colors">
            <span className="text-2xl shrink-0">💰</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-yellow-300">¡Hasta $1.000.000 en premios!</p>
              <p className="text-xs text-yellow-400/60 mt-0.5">Cuanto más somos, más crece el pozo</p>
            </div>
            <ArrowRight size={15} className="text-yellow-400 shrink-0" />
          </div>
        </Link>
      )}

      {/* Special predictions banner */}
      {specialNotFilled && specialStillOpen && (
        <Link to="/predicciones">
          <div className="mb-5 flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 hover:bg-amber-500/15 transition-colors">
            <AlertCircle size={18} className="text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-300">¡Completá tus predicciones especiales!</p>
              <p className="text-xs text-amber-400/70 mt-0.5">Elegí campeón, goleador y mejor jugador antes del 11 de junio.</p>
            </div>
            <ArrowRight size={15} className="text-amber-400 shrink-0" />
          </div>
        </Link>
      )}

      {/* Progress bar */}
      {predTotal > 0 && (
        <Link to="/predicciones" className="block mb-5">
          <div className="bg-union-navy-light border border-union-blue/20 rounded-xl px-4 py-3 hover:border-union-blue/40 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-white/40">Mis pronósticos</span>
              <span className={cn(
                'text-[11px] font-semibold',
                predComplete ? 'text-green-400' : predPct > 0 ? 'text-yellow-400' : 'text-white/30'
              )}>
                {predComplete ? '✓ Completo' : `${predFilled}/${predTotal}`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  predComplete ? 'bg-green-500' : predPct > 0 ? 'bg-yellow-400' : 'bg-white/10'
                )}
                style={{ width: `${predPct}%` }}
              />
            </div>
          </div>
        </Link>
      )}

      {/* WhatsApp share */}
      <div className="mb-5 rounded-xl border border-[#25D366]/25 bg-[#25D366]/8 px-4 py-3 flex items-center gap-3">
        <span className="text-2xl shrink-0">📲</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">¡Invitá a tus amigos al prode!</p>
          <p className="text-xs text-white/40 mt-0.5">Cuanto más somos, más grande el pozo</p>
        </div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent('🏆 ¡Animate al Prode del Mundial 2026!\nHay hasta $1.000.000 en premios 💰\nSumate acá 👉 www.prodequincho.com')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Compartir
        </a>
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
                <Card key={match.id} className={`overflow-hidden ${match.status === 'live' ? 'border-red-500/20' : ''}`}>
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <MatchFlag flag={match.home_flag} teamName={match.home_team} size={24} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{match.home_team} vs {match.away_team}</p>
                      <p className="text-xs text-white/40 truncate">{formatShortDate(match.match_date)}</p>
                    </div>
                    <MatchFlag flag={match.away_flag} teamName={match.away_team} size={24} />
                    <div className="shrink-0 ml-1">
                      {match.status === 'live' && match.home_score !== null && match.away_score !== null ? (
                        <div className="flex items-center gap-1">
                          <span className="text-base font-bold text-white tabular-nums">{match.home_score}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-base font-bold text-white tabular-nums">{match.away_score}</span>
                        </div>
                      ) : match.status === 'live' ? (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">En vivo</span>
                      ) : (
                        <Lock size={14} className="text-white/20" />
                      )}
                    </div>
                  </div>
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
            <h2 className="text-lg font-semibold text-white">
              🏆 {activeTournament?.name ?? 'Tabla general'}
            </h2>
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
