import { useState } from 'react'
import { Lock, CheckCircle2, Clock } from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatShortDate, isMatchLocked, calcPoints, cn } from '../../lib/utils'
import type { Match, Prediction } from '../../types'
import { useUpsertPrediction } from '../../hooks/usePredictions'

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
  const [saved, setSaved] = useState(false)

  const points = match.status === 'finished' && prediction
    ? calcPoints(match, prediction.home_score_pred, prediction.away_score_pred)
    : null

  async function handleSave() {
    const h = parseInt(home)
    const a = parseInt(away)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return
    await upsert.mutateAsync({ user_id: userId, match_id: match.id, tournament_id: tournamentId, home_score_pred: h, away_score_pred: a })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const statusBadge = match.status === 'finished'
    ? <Badge variant="gray">Finalizado</Badge>
    : match.status === 'live'
    ? <Badge variant="green">En vivo</Badge>
    : <Badge variant="blue">Próximo</Badge>

  return (
    <Card className="hover:border-union-blue/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {match.group_name && <Badge variant="blue">Grupo {match.group_name}</Badge>}
          {statusBadge}
        </div>
        <div className="flex items-center gap-1 text-xs text-white/40">
          <Clock size={12} />
          {formatShortDate(match.match_date)}
        </div>
      </div>

      {/* Teams + scores */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-2xl">{match.home_flag ?? '🏳️'}</span>
          <span className="text-sm font-semibold text-white text-center leading-tight">{match.home_team}</span>
        </div>

        {/* Score area */}
        <div className="flex flex-col items-center gap-2 min-w-[100px]">
          {match.status === 'finished' ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{match.home_score}</span>
              <span className="text-white/30">-</span>
              <span className="text-2xl font-bold text-white">{match.away_score}</span>
            </div>
          ) : (
            <span className="text-white/30 text-sm font-medium">VS</span>
          )}

          {/* Prediction inputs */}
          {!locked ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="20"
                value={home}
                onChange={(e) => setHome(e.target.value)}
                className="w-10 h-9 text-center bg-union-navy border border-union-blue/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-union-blue"
                placeholder="0"
              />
              <span className="text-white/30 text-xs">-</span>
              <input
                type="number"
                min="0"
                max="20"
                value={away}
                onChange={(e) => setAway(e.target.value)}
                className="w-10 h-9 text-center bg-union-navy border border-union-blue/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-union-blue"
                placeholder="0"
              />
            </div>
          ) : prediction ? (
            <div className="flex items-center gap-1 text-sm">
              <span className={cn('font-bold', points === 2 ? 'text-yellow-400' : points === 1 ? 'text-green-400' : 'text-white/40')}>
                {prediction.home_score_pred} - {prediction.away_score_pred}
              </span>
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
          <span className="text-2xl">{match.away_flag ?? '🏳️'}</span>
          <span className="text-sm font-semibold text-white text-center leading-tight">{match.away_team}</span>
        </div>
      </div>

      {/* Points badge + save button */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-union-blue/10">
        {points !== null ? (
          <span className={cn(
            'text-xs font-bold px-2 py-0.5 rounded',
            points === 2 ? 'bg-yellow-500/20 text-yellow-400' : points === 1 ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'
          )}>
            {points === 2 ? '⭐ +2 pts (exacto)' : points === 1 ? '✓ +1 pt' : '✗ 0 pts'}
          </span>
        ) : <span />}

        {!locked && (
          <Button size="sm" onClick={handleSave} loading={upsert.isPending} className="ml-auto">
            {saved ? <><CheckCircle2 size={14} className="mr-1" /> Guardado</> : 'Guardar'}
          </Button>
        )}
      </div>

      {match.venue && (
        <p className="text-xs text-white/25 mt-1 truncate">{match.venue}</p>
      )}
    </Card>
  )
}
