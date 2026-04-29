import { Trophy, Medal, User } from 'lucide-react'
import type { LeaderboardEntry } from '../../types'
import { cn } from '../../lib/utils'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-union-blue/20">
      <table className="w-full">
        <thead>
          <tr className="bg-union-navy-mid/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-union-blue uppercase tracking-wider">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-union-blue uppercase tracking-wider">Jugador</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-union-blue uppercase tracking-wider">Pts</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-union-blue uppercase tracking-wider hidden sm:table-cell">Exactos</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-union-blue uppercase tracking-wider hidden md:table-cell">Resultados</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-union-blue uppercase tracking-wider hidden lg:table-cell">Pronóst.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-union-blue/10">
          {entries.map((entry) => {
            const isCurrentUser = entry.user_id === currentUserId
            return (
              <tr
                key={entry.user_id}
                className={cn(
                  'transition-colors',
                  isCurrentUser ? 'bg-union-blue/10' : 'hover:bg-white/5'
                )}
              >
                <td className="px-4 py-3">
                  <RankIcon rank={entry.rank} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
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
                <td className="px-4 py-3 text-right text-sm text-white/60 hidden md:table-cell">{entry.correct_outcomes}</td>
                <td className="px-4 py-3 text-right text-sm text-white/40 hidden lg:table-cell">{entry.total_predictions}</td>
              </tr>
            )
          })}
          {entries.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">
                Aún no hay pronósticos en este torneo
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={18} className="text-yellow-400" />
  if (rank === 2) return <Medal size={18} className="text-gray-300" />
  if (rank === 3) return <Medal size={18} className="text-amber-600" />
  return <span className="text-sm font-medium text-white/40">{rank}</span>
}
