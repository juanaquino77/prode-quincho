import { useState } from 'react'
import { Lock, CheckCircle2, Clock } from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatShortDate, isMatchLocked, calcPoints, cn } from '../../lib/utils'
import type { Match, Prediction, PenaltyWinner } from '../../types'
import { KNOCKOUT_STAGES } from '../../types'
import { useUpsertPrediction } from '../../hooks/usePredictions'

function TeamBadge({ flag }: { flag: string | null }) {
  if (flag && flag.startsWith('http')) {
    return <img src={flag} alt="" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
  }
  return <span className="text-2xl">{flag ?? '⚽'}</span>
}

interface MatchCardProps {
  match: Match
  prediction?: Prediction
  tournamentId: string
  userId: string
}

export function MatchCard({ match, prediction, tournamentId, userId }: MatchCardProps) {
  const locked = isMatchLocked(match)
  const upsert = useUpsertPrediction()

  const [home, setHome] = useState<string>(prediction?.home_score_pred?.toString() ?? '')
  const [away, setAway] = useState<string>(prediction?.away_score_pred?.toString() ?? '')
  const [penaltyPred, setPenaltyPred] = useState<PenaltyWinner | null>(
    prediction?.penalty_pred ?? null
  )
  const [saved, setSaved] = useState(false)

  // Derived flags
  const isKnockout = KNOCKOUT_STAGES.includes(match.stage)
  const h = parseInt(home)
  const a = parseInt(away)
  const inputsAreDraw = !isNaN(h) && !isNaN(a) && h === a
  const penaltyRequired = isKnockout && inputsAreDraw

  // Points (only when finished and prediction exists)
  const points =
    match.status === 'finished' && prediction
      ? calcPoints(match, prediction.home_score_pred, prediction.away_score_pred, prediction.penalty_pred)
      : null

  function handleHomeChange(val: string) {
    setHome(val)
    // Reset penalty if scores are no longer equal
    if (parseInt(val) !== parseInt(away)) setPenaltyPred(null)
  }

  function handleAwayChange(val: string) {
    setAway(val)
    if (parseInt(home) !== parseInt(val)) setPenaltyPred(null)
  }

  async function handleSave() {
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return
    if (penaltyRequired && penaltyPred === null) return
    await upsert.mutateAsync({
      user_id: userId,
      match_id: match.id,
      tournament_id: tournamentId,
      home_score_pred: h,
      away_score_pred: a,
      penalty_pred: penaltyRequired ? penaltyPred : null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const statusBadge =
    match.status === 'finished' ? (
      <Badge variant="gray">Finalizado</Badge>
    ) : match.status === 'live' ? (
      <Badge variant="green">En vivo</Badge>
    ) : (
      <Badge variant="blue">Próximo</Badge>
    )

  // Points badge config
  const pointsBadge =
    points === null
      ? null
      : points >= 4
      ? { label: '⭐ +4 pts (exacto+penales)', cls: 'bg-yellow-500/20 text-yellow-400' }
      : points === 3
      ? { label: '⭐ +3 pts (exacto)', cls: 'bg-yellow-500/20 text-yellow-400' }
      : points === 2
      ? { label: '✓ +2 pts', cls: 'bg-green-500/20 text-green-400' }
      : points === 1
      ? { label: '✓ +1 pt', cls: 'bg-green-500/20 text-green-400' }
      : { label: '✗ 0 pts', cls: 'bg-white/5 text-white/30' }

  return (
    <Card className="hover:border-union-blue/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {match.group_name && <Badge variant="blue">Grupo {match.group_name}</Badge>}
          {isKnockout && !match.group_name && <Badge variant="gray">Eliminatoria</Badge>}
          {statusBadge}
        </div>
        <div className="flex items-center gap-1 text-xs text-white/40">
          <Clock size={12} />
          {formatShortDate(match.match_date)}
        </div>
      </div>

      {/* Teams + score area */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <TeamBadge flag={match.home_flag} />
          <span className="text-sm font-semibold text-white text-center leading-tight">
            {match.home_team}
          </span>
        </div>

        {/* Center: result / inputs */}
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          {match.status === 'finished' ? (
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{match.home_score}</span>
                <span className="text-white/30">-</span>
                <span className="text-2xl font-bold text-white">{match.away_score}</span>
              </div>
              {match.penalty_winner && (
                <span className="text-xs text-white/40">
                  Pen: {match.penalty_winner === 'home' ? match.home_team : match.away_team}
                </span>
              )}
            </div>
          ) : (
            <span className="text-white/30 text-sm font-medium">VS</span>
          )}

          {!locked ? (
            <div className="flex flex-col items-center gap-2">
              {/* Score inputs */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={home}
                  onChange={(e) => handleHomeChange(e.target.value)}
                  className="w-10 h-9 text-center bg-union-navy border border-union-blue/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-union-blue"
                  placeholder="0"
                />
                <span className="text-white/30 text-xs">-</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={away}
                  onChange={(e) => handleAwayChange(e.target.value)}
                  className="w-10 h-9 text-center bg-union-navy border border-union-blue/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-union-blue"
                  placeholder="0"
                />
              </div>

              {/* Penalty picker — appears only in knockout draws */}
              {penaltyRequired && (
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <span className="text-xs text-yellow-400 font-semibold text-center">
                    ¿Quién gana en penales?
                  </span>
                  <div className="flex gap-1.5 w-full justify-center">
                    <button
                      type="button"
                      onClick={() => setPenaltyPred('home')}
                      className={cn(
                        'flex-1 max-w-[90px] px-2 py-1 rounded-md text-xs font-semibold transition-colors border truncate',
                        penaltyPred === 'home'
                          ? 'bg-union-blue text-white border-union-blue'
                          : 'bg-union-navy border-union-blue/30 text-white/60 hover:text-white hover:border-union-blue/60'
                      )}
                    >
                      {match.home_team}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPenaltyPred('away')}
                      className={cn(
                        'flex-1 max-w-[90px] px-2 py-1 rounded-md text-xs font-semibold transition-colors border truncate',
                        penaltyPred === 'away'
                          ? 'bg-union-blue text-white border-union-blue'
                          : 'bg-union-navy border-union-blue/30 text-white/60 hover:text-white hover:border-union-blue/60'
                      )}
                    >
                      {match.away_team}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : prediction ? (
            <div className="flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  'font-bold text-sm',
                  points !== null && points > 0
                    ? points >= 3
                      ? 'text-yellow-400'
                      : 'text-green-400'
                    : 'text-white/40'
                )}
              >
                {prediction.home_score_pred} - {prediction.away_score_pred}
              </span>
              {prediction.penalty_pred && (
                <span className="text-xs text-white/40">
                  Pen: {prediction.penalty_pred === 'home' ? match.home_team : match.away_team}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-white/30 text-xs">
              <Lock size={12} />
              Sin pronóstico
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <TeamBadge flag={match.away_flag} />
          <span className="text-sm font-semibold text-white text-center leading-tight">
            {match.away_team}
          </span>
        </div>
      </div>

      {/* Points badge + save button */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-union-blue/10">
        {pointsBadge ? (
          <span className={cn('text-xs font-bold px-2 py-0.5 rounded', pointsBadge.cls)}>
            {pointsBadge.label}
          </span>
        ) : (
          <span />
        )}

        {!locked && (
          <Button
            size="sm"
            onClick={handleSave}
            loading={upsert.isPending}
            disabled={penaltyRequired && penaltyPred === null}
            className="ml-auto"
          >
            {saved ? (
              <>
                <CheckCircle2 size={14} className="mr-1" /> Guardado
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        )}
      </div>

      {match.venue && (
        <p className="text-xs text-white/25 mt-1 truncate">{match.venue}</p>
      )}
    </Card>
  )
}
