import { useMemo } from 'react'
import { User } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { ClubFlag } from '../ui/ClubFlag'
import { useMatches } from '../../hooks/useMatches'
import { usePredictions } from '../../hooks/usePredictions'
import { calcPoints, getStageName, isMatchLocked, cn } from '../../lib/utils'
import type { LeaderboardEntry } from '../../types'
import { STAGE_ORDER } from '../../lib/stageOrder'

interface Props {
  open: boolean
  onClose: () => void
  entry: LeaderboardEntry | null
  tournamentId: string
  competition?: string | null
  isAdmin?: boolean
}

export function UserPredictionsModal({ open, onClose, entry, tournamentId, competition, isAdmin }: Props) {
  const { data: matches } = useMatches(competition ?? undefined)
  const { data: predictions, isLoading } = usePredictions(entry?.user_id, tournamentId)

  const predMap = useMemo(
    () => new Map((predictions ?? []).map((p) => [p.match_id, p])),
    [predictions],
  )

  // Group matches by stage; non-admins only see locked matches
  const byStage = useMemo(() => {
    const map = new Map<string, typeof matches>()
    for (const stage of STAGE_ORDER) {
      let ms = (matches ?? []).filter((m) => m.stage === stage)
      if (!isAdmin) ms = ms.filter(isMatchLocked)
      if (ms.length > 0) map.set(stage, ms)
    }
    return map
  }, [matches, isAdmin])

  if (!entry) return null

  return (
    <Modal open={open} onClose={onClose} title="">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 -mt-1">
        {entry.avatar_url ? (
          <img src={entry.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-union-blue/20 flex items-center justify-center">
            <User size={16} className="text-union-blue" />
          </div>
        )}
        <div>
          <p className="text-white font-semibold">{entry.username}</p>
          {entry.full_name && <p className="text-xs text-white/40">{entry.full_name}</p>}
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-union-blue">{entry.total_points}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wide">pts totales</p>
        </div>
      </div>

      {!isAdmin && (
        <p className="text-[11px] text-white/30 mb-3 italic">Solo se muestran pronósticos de partidos ya cerrados</p>
      )}

      {isLoading ? (
        <p className="text-center text-white/40 py-8 text-sm">Cargando pronósticos...</p>
      ) : (
        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
          {[...byStage.entries()].map(([stage, stageMatches]) => (
            <div key={stage}>
              <p className="text-[10px] font-bold text-union-blue uppercase tracking-widest mb-2">
                {getStageName(stage as any)}
              </p>
              <div className="space-y-1.5">
                {stageMatches!.map((match) => {
                  const pred = predMap.get(match.id)
                  const finished = match.status === 'finished'
                  const pts = finished && pred
                    ? calcPoints(match, pred.home_score_pred, pred.away_score_pred, pred.penalty_pred)
                    : null

                  return (
                    <div
                      key={match.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-union-navy border border-union-blue/10"
                    >
                      {/* Home */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <ClubFlag teamName={match.home_team} size={18} />
                        <span className="text-xs text-white/70 truncate">{match.home_team}</span>
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-1 shrink-0 text-center">
                        {pred ? (
                          <>
                            <span className={cn(
                              'text-sm font-bold tabular-nums w-5 text-center',
                              finished
                                ? pts && pts > 0 ? 'text-green-400' : 'text-red-400'
                                : 'text-white'
                            )}>
                              {pred.home_score_pred}
                            </span>
                            <span className="text-white/30 text-xs">-</span>
                            <span className={cn(
                              'text-sm font-bold tabular-nums w-5 text-center',
                              finished
                                ? pts && pts > 0 ? 'text-green-400' : 'text-red-400'
                                : 'text-white'
                            )}>
                              {pred.away_score_pred}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-white/20 w-12 text-center">–</span>
                        )}
                      </div>

                      {/* Away */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                        <span className="text-xs text-white/70 truncate text-right">{match.away_team}</span>
                        <ClubFlag teamName={match.away_team} size={18} />
                      </div>

                      {/* Points pill */}
                      <div className="w-12 text-right shrink-0">
                        {pts !== null ? (
                          <span className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded',
                            pts >= 3 ? 'bg-yellow-500/20 text-yellow-400'
                            : pts > 0 ? 'bg-green-500/20 text-green-400'
                            : 'bg-white/5 text-white/30'
                          )}>
                            {pts > 0 ? `+${pts}` : '0'} pts
                          </span>
                        ) : finished ? (
                          <span className="text-[10px] text-white/20">–</span>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
