import { useMemo } from 'react'
import { User } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { ClubFlag } from '../ui/ClubFlag'
import { useMatches } from '../../hooks/useMatches'
import { usePredictions } from '../../hooks/usePredictions'
import { useCorazonadas } from '../../hooks/useCorazonada'
import { useSpecialPredictions } from '../../hooks/useSpecialPredictions'
import { calcPoints, getStageName, resolveMatches, cn } from '../../lib/utils'
import type { LeaderboardEntry } from '../../types'
import { STAGE_ORDER } from '../../lib/stageOrder'

interface Props {
  open: boolean
  onClose: () => void
  entry: LeaderboardEntry | null
  tournamentId: string
  competition?: string | null
  isAdmin?: boolean
  showRivalPredictions?: 'before' | 'after'
  hasCorazonada?: boolean
  ptsCorazonadaBonus?: number
  hasSpecialPredictions?: boolean
}

export function UserPredictionsModal({ open, onClose, entry, tournamentId, competition, isAdmin, showRivalPredictions = 'after', hasCorazonada, ptsCorazonadaBonus = 5, hasSpecialPredictions }: Props) {
  const { data: matches } = useMatches(competition ?? undefined)
  const { data: predictions, isLoading } = usePredictions(entry?.user_id, tournamentId)
  const { data: corazonadas = [] } = useCorazonadas(
    isAdmin && hasCorazonada ? entry?.user_id : undefined,
    isAdmin && hasCorazonada ? tournamentId : undefined,
  )
  const { data: specialPred } = useSpecialPredictions(
    isAdmin && hasSpecialPredictions ? entry?.user_id : undefined,
    isAdmin && hasSpecialPredictions ? tournamentId : undefined,
  )
  const corazonadaMatchIds = useMemo(() => new Set(corazonadas.map(c => c.match_id)), [corazonadas])

  const predMap = useMemo(
    () => new Map((predictions ?? []).map((p) => [p.match_id, p])),
    [predictions],
  )

  const canSeeAll = isAdmin || showRivalPredictions === 'before'

  // Group matches by stage; visibility depends on tournament configuration
  const byStage = useMemo(() => {
    const map = new Map<string, typeof matches>()
    const resolved = resolveMatches(matches ?? [])
    for (const stage of STAGE_ORDER) {
      let ms = resolved.filter((m) => m.stage === stage)
      // Mostrar pronósticos rivales cuando el partido ya empezó (live o finished)
      if (!canSeeAll) ms = ms.filter((m) => m.status !== 'upcoming')
      if (ms.length > 0) map.set(stage, ms)
    }
    return map
  }, [matches, canSeeAll])

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

      {!canSeeAll && (
        <p className="text-[11px] text-white/30 mb-3 italic">Solo se muestran pronósticos de partidos ya cerrados</p>
      )}

      {/* Predicciones especiales (solo admin) */}
      {isAdmin && specialPred && (
        <div className="mb-4 bg-union-navy rounded-xl p-3 border border-amber-500/20">
          <p className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest mb-2">⭐ Predicciones especiales</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-white/40 mb-0.5">Campeón</p>
              <p className="text-xs font-semibold text-white">{specialPred.champion_team ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 mb-0.5">Goleador</p>
              <p className="text-xs font-semibold text-white">{specialPred.top_scorer ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 mb-0.5">MVP</p>
              <p className="text-xs font-semibold text-white">{specialPred.best_player ?? '—'}</p>
            </div>
          </div>
        </div>
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
                  const isCorazonada = corazonadaMatchIds.has(match.id)
                  // Con corazonada exacta, pts_corazonada_bonus reemplaza (no suma) el puntaje exacto
                  const displayPts = pts !== null && isCorazonada && pts >= 3
                    ? ptsCorazonadaBonus
                    : pts

                  return (
                    <div
                      key={match.id}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border',
                        isCorazonada
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-union-navy border-union-blue/10'
                      )}
                    >
                      {/* Corazonada indicator */}
                      {isAdmin && (
                        <span className={cn('text-xs shrink-0', isCorazonada ? 'text-amber-400' : 'text-transparent')}>
                          💛
                        </span>
                      )}

                      {/* Home */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <ClubFlag teamName={match.home_team} size={18} />
                        <span className="text-xs text-white/70 truncate">{match.home_team}</span>
                      </div>

                      {/* Score prediction */}
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

                      {/* Actual result (admin only, when finished) */}
                      {isAdmin && finished && (
                        <span className="text-[10px] text-white/30 shrink-0">
                          ({match.home_score}-{match.away_score})
                        </span>
                      )}

                      {/* Away */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                        <span className="text-xs text-white/70 truncate text-right">{match.away_team}</span>
                        <ClubFlag teamName={match.away_team} size={18} />
                      </div>

                      {/* Points pill */}
                      <div className="w-12 text-right shrink-0">
                        {displayPts !== null ? (
                          <span className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded',
                            displayPts >= 3 ? 'bg-yellow-500/20 text-yellow-400'
                            : displayPts > 0 ? 'bg-green-500/20 text-green-400'
                            : 'bg-white/5 text-white/30'
                          )}>
                            {displayPts > 0 ? `+${displayPts}` : '0'} pts
                          </span>
                        ) : finished ? (
                          <span className="text-[10px] text-white/20">–</span>
                        ) : pred && !finished ? (
                          <span className="text-[10px] text-white/20">pdte.</span>
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
