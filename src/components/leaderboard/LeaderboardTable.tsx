import { useState } from 'react'
import { Trophy, Medal, User } from 'lucide-react'
import { UserPredictionsModal } from './UserPredictionsModal'
import type { LeaderboardEntry } from '../../types'
import { cn } from '../../lib/utils'

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

  function handleRowClick(entry: LeaderboardEntry) {
    if (!tournamentId) return
    if (entry.user_id === currentUserId) return
    setSelectedEntry(entry)
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-union-blue/20">
        <table className="w-full">
          <thead>
            <tr className="bg-union-navy-mid/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-union-blue uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-union-blue uppercase tracking-wider">Jugador</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-union-blue uppercase tracking-wider">Pts</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-union-blue uppercase tracking-wider hidden sm:table-cell">Exactos</th>
              {hasCorazonada && <th className="px-4 py-3 text-right text-xs font-semibold text-amber-400/70 uppercase tracking-wider hidden sm:table-cell">💛 Coraz.</th>}
              <th className="px-4 py-3 text-right text-xs font-semibold text-union-blue uppercase tracking-wider hidden md:table-cell">Resultados</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-union-blue uppercase tracking-wider hidden lg:table-cell">Pronóst.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-union-blue/10">
            {entries.map((entry) => {
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
