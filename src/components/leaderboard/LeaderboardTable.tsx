import { useState } from 'react'
import { Trophy, Medal, User, ChevronUp, ChevronDown } from 'lucide-react'
import { UserPredictionsModal } from './UserPredictionsModal'
import type { LeaderboardEntry } from '../../types'
import { cn } from '../../lib/utils'

type SortKey = 'rank' | 'username' | 'total_points' | 'exact_scores' | 'corazonadas_acertadas' | 'correct_outcomes' | 'total_predictions'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  isAdmin?: boolean
  tournamentId?: string
  competition?: string | null
  showRivalPredictions?: 'before' | 'after'
  hasCorazonada?: boolean
  hasSpecialPredictions?: boolean
}

export function LeaderboardTable({ entries, currentUserId, isAdmin, tournamentId, competition, showRivalPredictions, hasCorazonada, hasSpecialPredictions }: LeaderboardTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'username' ? 'asc' : 'desc')
    }
  }

  const sorted = [...entries].sort((a, b) => {
    let diff = 0
    if (sortKey === 'username') diff = (a.username ?? '').localeCompare(b.username ?? '')
    else if (sortKey === 'rank') diff = a.rank - b.rank
    else diff = ((a[sortKey] as number) ?? 0) - ((b[sortKey] as number) ?? 0)
    return sortDir === 'asc' ? diff : -diff
  })

  function handleRowClick(entry: LeaderboardEntry) {
    if (!tournamentId) return
    if (entry.user_id === currentUserId) return
    setSelectedEntry(entry)
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp size={11} className="ml-0.5 opacity-20 inline" />
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="ml-0.5 text-white inline" />
      : <ChevronDown size={11} className="ml-0.5 text-white inline" />
  }

  function Th({ col, label, className }: { col: SortKey; label: string; className?: string }) {
    return (
      <th
        onClick={() => handleSort(col)}
        className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors hover:text-white', sortKey === col ? 'text-white' : 'text-union-blue', className)}
      >
        {label}<SortIcon col={col} />
      </th>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-union-blue/20">
        <table className="w-full">
          <thead>
            <tr className="bg-union-navy-mid/50">
              <Th col="rank" label="#" className="text-left" />
              <Th col="username" label="Jugador" className="text-left" />
              <Th col="total_points" label="Pts" className="text-right" />
              <Th col="exact_scores" label="Exactos" className="text-right hidden sm:table-cell" />
              {hasCorazonada && <Th col="corazonadas_acertadas" label="💛 Coraz." className="text-right hidden sm:table-cell text-amber-400/70" />}
              <Th col="correct_outcomes" label="Resultados" className="text-right hidden md:table-cell" />
              <Th col="total_predictions" label="Pronóst." className="text-right hidden lg:table-cell" />
            </tr>
          </thead>
          <tbody className="divide-y divide-union-blue/10">
            {sorted.map((entry) => {
              const isCurrentUser = entry.user_id === currentUserId
              const clickable = !!tournamentId && entry.user_id !== currentUserId
              return (
                <tr
                  key={entry.user_id}
                  onClick={() => handleRowClick(entry)}
                  className={cn(
                    'transition-colors',
                    isCurrentUser ? 'bg-union-blue/10' : 'hover:bg-white/5',
                    clickable && 'cursor-pointer',
                  )}
                >
                  <td className="px-4 py-3">
                    <RankIcon rank={entry.rank} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StreakIcon hotLevel={entry.hot_level ?? 0} isCold={entry.is_cold ?? false} />
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-union-blue/20 flex items-center justify-center">
                          <User size={14} className="text-union-blue" />
                        </div>
                      )}
                      <div>
                        <p className={cn('text-sm font-medium', isCurrentUser ? 'text-union-blue' : 'text-white')}>
                          {entry.username}
                          {isCurrentUser && <span className="ml-1 text-xs text-union-blue/60">(vos)</span>}
                          {clickable && (
                            <span className="ml-1 text-[10px] text-white/20 hidden group-hover:inline">ver pronósticos</span>
                          )}
                          {isAdmin && (
                            <span className={cn(
                              'ml-1.5 text-[10px] font-semibold px-1 py-0.5 rounded',
                              entry.free_pass
                                ? 'bg-purple-500/20 text-purple-300'
                                : entry.paid
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                            )}>
                              {entry.free_pass ? '🎟 pase libre' : entry.paid ? '✓ pagó' : '✗ debe'}
                            </span>
                          )}
                          {isAdmin && entry.paid && entry.total_predictions === 0 && (
                            <span className="ml-1 text-[10px] font-bold px-1 py-0.5 rounded bg-amber-500/30 text-amber-300 animate-pulse">
                              avisar!!!
                            </span>
                          )}
                          {isAdmin && !entry.paid && !entry.free_pass && entry.total_predictions > 0 && (
                            <span className="ml-1 text-[10px] font-bold px-1 py-0.5 rounded bg-orange-500/30 text-orange-300 animate-pulse">
                              reclamar pago
                            </span>
                          )}
                        </p>
                        {entry.full_name && <p className="text-xs text-white/40">{entry.full_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      'text-lg font-bold',
                      entry.rank === 1 ? 'text-yellow-400' : entry.rank <= 3 ? 'text-union-blue-light' : 'text-white'
                    )}>
                      {entry.total_points}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-white/60 hidden sm:table-cell">{entry.exact_scores}</td>
                  {hasCorazonada && <td className="px-4 py-3 text-right text-sm text-amber-400 hidden sm:table-cell">{entry.corazonadas_acertadas ?? 0}</td>}
                  <td className="px-4 py-3 text-right text-sm text-white/60 hidden md:table-cell">{entry.correct_outcomes}</td>
                  <td className="px-4 py-3 text-right text-sm text-white/40 hidden lg:table-cell">{entry.total_predictions}</td>
                </tr>
              )
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan={hasCorazonada ? 7 : 6} className="px-4 py-12 text-center text-white/30 text-sm">
                  Aún no hay pronósticos en este torneo
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tournamentId && (
        <UserPredictionsModal
          open={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          entry={selectedEntry}
          tournamentId={tournamentId}
          competition={competition}
          isAdmin={isAdmin}
          showRivalPredictions={showRivalPredictions}
          hasCorazonada={hasCorazonada}
          hasSpecialPredictions={hasSpecialPredictions}
        />
      )}
    </>
  )
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={18} className="text-yellow-400" />
  if (rank === 2) return <Medal size={18} className="text-gray-300" />
  if (rank === 3) return <Medal size={18} className="text-amber-600" />
  return <span className="text-sm font-medium text-white/40">{rank}</span>
}

function StreakIcon({ hotLevel, isCold }: { hotLevel: number; isCold: boolean }) {
  if (isCold) {
    return (
      <span
        className="text-base leading-none animate-pulse cursor-default select-none shrink-0"
        title="🧊 Frío... Sin sumar puntos en los últimos 3 partidos"
      >
        🧊
      </span>
    )
  }

  if (hotLevel >= 2) {
    return (
      <span
        className="text-base leading-none animate-bounce cursor-default select-none shrink-0"
        title="🔥🔥 ¡En llamas! 7 o más puntos en los últimos 3 partidos"
      >
        🔥🔥
      </span>
    )
  }

  if (hotLevel === 1) {
    return (
      <span
        className="text-base leading-none animate-bounce cursor-default select-none shrink-0"
        title="🔥 ¡En racha! 2 o más puntos en los últimos 3 partidos"
      >
        🔥
      </span>
    )
  }

  return <span className="w-5 shrink-0" />
}
