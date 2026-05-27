import { useState, useEffect, useRef } from 'react'
import { Lock, CheckCircle2, Clock, Pencil, X } from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatShortDate, formatLockDeadline, isMatchLocked, calcPoints, cn } from '../../lib/utils'
import { ClubFlag } from '../ui/ClubFlag'
import type { Match, Prediction, PenaltyWinner } from '../../types'
import { KNOCKOUT_STAGES } from '../../types'
import { useUpsertPrediction } from '../../hooks/usePredictions'

function TeamBadge({ flag, teamName }: { flag: string | null; teamName: string }) {
  const isNationalTeamEmoji = flag && !flag.startsWith('http')
  if (isNationalTeamEmoji) return <span className="text-2xl">{flag}</span>
  return <ClubFlag teamName={teamName} size={40} />
}

interface MatchCardProps {
  match: Match
  prediction?: Prediction
  tournamentId: string
  userId: string
  phaseLocked?: boolean
  phaseUnlockAt?: Date
  highlighted?: boolean
  lockAt?: Date
  requiresExactScore?: boolean
  rules?: { pts_exact?: number; pts_outcome?: number; pts_penalty_correct?: number; pts_penalty_wrong_deduct?: number; pts_penalty_wrong_deduct_draw_outcome?: number; requires_exact_score?: boolean }
  /** Modo batch: sin botón individual; inputs siempre editables; notifica cambios al padre */
  batchMode?: boolean
  onBatchChange?: (matchId: string, home: string, away: string, penalty: PenaltyWinner | null) => void
}

// ── Countdown ──────────────────────────────────────────────────
function Countdown({ unlockAt }: { unlockAt: Date }) {
  const [remaining, setRemaining] = useState(unlockAt.getTime() - Date.now())

  useEffect(() => {
    const id = setInterval(() => setRemaining(unlockAt.getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [unlockAt])

  if (remaining <= 0) return <span className="text-[10px] text-white/30">Desbloqueando...</span>

  const totalSec = Math.floor(remaining / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] text-white/30">Disponible en</span>
      <span className="text-base font-mono font-bold text-white/60 tabular-nums">
        {d > 0 ? `${d}d ` : ''}{String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    </div>
  )
}

type Outcome1X2 = 'home' | 'draw' | 'away'

function decodeOutcome(h: number, a: number): Outcome1X2 {
  if (h > a) return 'home'
  if (h < a) return 'away'
  return 'draw'
}

export function MatchCard({ match, prediction, tournamentId, userId, phaseLocked, phaseUnlockAt, highlighted, lockAt, requiresExactScore = true, rules, batchMode = false, onBatchChange }: MatchCardProps) {
  const locked = isMatchLocked(match, lockAt)
  const upsert = useUpsertPrediction()
  const cardRef = useRef<HTMLDivElement>(null)
  const homeRef = useRef<HTMLInputElement>(null)
  const awayRef = useRef<HTMLInputElement>(null)
  const mode1X2 = !requiresExactScore

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlighted])

  const [home, setHome] = useState<string>(prediction?.home_score_pred?.toString() ?? '')
  const [away, setAway] = useState<string>(prediction?.away_score_pred?.toString() ?? '')
  const [penaltyPred, setPenaltyPred] = useState<PenaltyWinner | null>(prediction?.penalty_pred ?? null)
  const [committedPenalty, setCommittedPenalty] = useState<PenaltyWinner | null>(prediction?.penalty_pred ?? null)
  const [saved, setSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showWarn, setShowWarn] = useState(false)

  // Sync inputs when prediction arrives from React Query (async load)
  useEffect(() => {
    if (prediction) {
      setHome(prediction.home_score_pred?.toString() ?? '')
      setAway(prediction.away_score_pred?.toString() ?? '')
      setPenaltyPred(prediction.penalty_pred ?? null)
      setCommittedPenalty(prediction.penalty_pred ?? null)
      setIsEditing(false)
    }
  }, [prediction?.home_score_pred, prediction?.away_score_pred, prediction?.penalty_pred])

  const isKnockout = KNOCKOUT_STAGES.includes(match.stage)
  const hVal = parseInt(home)
  const aVal = parseInt(away)
  const inputsAreDraw = !isNaN(hVal) && !isNaN(aVal) && hVal === aVal
  const penaltyRequired = isKnockout && inputsAreDraw

  // Outcome seleccionado en modo 1X2
  const selectedOutcome: Outcome1X2 | null =
    mode1X2 && !isNaN(hVal) && !isNaN(aVal) ? decodeOutcome(hVal, aVal) : null

  function handleOutcomeClick(outcome: Outcome1X2) {
    if (outcome === 'home')  { setHome('1'); setAway('0'); setPenaltyPred(null); setCommittedPenalty(null) }
    if (outcome === 'away')  { setHome('0'); setAway('1'); setPenaltyPred(null); setCommittedPenalty(null) }
    if (outcome === 'draw')  { setHome('0'); setAway('0') }
  }

  const points =
    match.status === 'finished' && prediction
      ? calcPoints(match, prediction.home_score_pred, prediction.away_score_pred, prediction.penalty_pred, rules)
      : null

  // En batch mode: notificar al padre cuando cambian los valores
  useEffect(() => {
    if (!batchMode || !onBatchChange) return
    onBatchChange(match.id, home, away, penaltyPred)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home, away, penaltyPred, batchMode])

  // Inputs are disabled when: time-locked, phase-locked, or (prediction exists but not editing — solo fuera de batch mode)
  const inputsDisabled = locked || phaseLocked || (!batchMode && !!prediction && !isEditing)

  function handleHomeChange(val: string) {
    setHome(val)
    if (parseInt(val) !== parseInt(away)) { setPenaltyPred(null); setCommittedPenalty(null) }
  }

  function handleAwayChange(val: string) {
    setAway(val)
    if (parseInt(home) !== parseInt(val)) { setPenaltyPred(null); setCommittedPenalty(null) }
  }

  function handleCancelEdit() {
    setHome(prediction?.home_score_pred?.toString() ?? '')
    setAway(prediction?.away_score_pred?.toString() ?? '')
    setPenaltyPred(prediction?.penalty_pred ?? null)
    setCommittedPenalty(prediction?.penalty_pred ?? null)
    setIsEditing(false)
  }

  async function doSave() {
    await upsert.mutateAsync({
      user_id: userId,
      match_id: match.id,
      tournament_id: tournamentId,
      home_score_pred: hVal,
      away_score_pred: aVal,
      penalty_pred: penaltyRequired ? penaltyPred : null,
    })
    if (penaltyRequired && penaltyPred) setCommittedPenalty(penaltyPred)
    setSaved(true)
    setIsEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSave() {
    if (mode1X2) {
      if (selectedOutcome === null) return
      if (penaltyRequired && penaltyPred === null) return
    } else {
      if (isNaN(hVal) || isNaN(aVal) || hVal < 0 || aVal < 0) return
      if (penaltyRequired && penaltyPred === null) return
      if (Math.abs(hVal - aVal) > 5) { setShowWarn(true); return }
    }
    await doSave()
  }

  const statusBadge =
    match.status === 'finished' ? <Badge variant="gray">Finalizado</Badge>
    : match.status === 'live'   ? <Badge variant="green">En vivo</Badge>
    :                             <Badge variant="blue">Próximo</Badge>

  const pointsBadge =
    points === null ? null
    : points >= 4   ? { label: '⭐ +4 pts (exacto+penales)', cls: 'bg-yellow-500/20 text-yellow-400' }
    : points === 3  ? { label: '⭐ +3 pts (exacto)',         cls: 'bg-yellow-500/20 text-yellow-400' }
    : points === 2  ? { label: '✓ +2 pts',                  cls: 'bg-green-500/20 text-green-400'   }
    : points === 1  ? { label: '✓ +1 pt',                   cls: 'bg-green-500/20 text-green-400'   }
    :                 { label: '✗ 0 pts',                   cls: 'bg-white/5 text-white/30'         }

  const showPenaltyPicker = !inputsDisabled && penaltyRequired && !committedPenalty
  const showPenaltyBadge  = !inputsDisabled && penaltyRequired && committedPenalty !== null

  return (
    <div ref={cardRef} className="h-full">
    <Card className={cn(
      'hover:border-union-blue/40 transition-colors h-full flex flex-col',
      highlighted && 'ring-2 ring-union-blue shadow-[0_0_24px_rgba(0,168,222,0.25)]'
    )}>
      {/* Header */}
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
          <TeamBadge flag={match.home_flag} teamName={match.home_team} />
          <span className="text-sm font-semibold text-white text-center leading-tight">{match.home_team}</span>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          {/* Actual result */}
          {match.status === 'finished' ? (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Resultado</span>
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

          {/* Prediction inputs or countdown */}
          {phaseLocked ? (
            <div className="flex flex-col items-center gap-1 text-center px-2">
              {phaseUnlockAt
                ? <Countdown unlockAt={phaseUnlockAt} />
                : <span className="text-[10px] text-white/30">Pendiente de clasificados</span>}
            </div>
          ) : locked && !prediction ? (
            <div className="flex items-center gap-1 text-white/30 text-xs">
              <Lock size={12} /> Sin pronóstico
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {match.status === 'finished' && prediction && (
                <span className="text-[10px] font-semibold text-union-blue/60 uppercase tracking-wider">Tu pronóstico</span>
              )}
              {/* Inputs: modo exacto = scores, modo 1X2 = botones L/E/V */}
              {mode1X2 ? (
                <div className="flex gap-1 w-full justify-center">
                  {(['home', 'draw', 'away'] as Outcome1X2[]).map((outcome) => {
                    const label = outcome === 'home' ? 'L' : outcome === 'draw' ? 'E' : 'V'
                    const isSelected = selectedOutcome === outcome
                    return (
                      <button
                        key={outcome}
                        type="button"
                        disabled={inputsDisabled}
                        onClick={() => handleOutcomeClick(outcome)}
                        className={cn(
                          'w-10 h-9 rounded text-sm font-bold transition-colors border',
                          isSelected
                            ? 'bg-union-blue text-white border-union-blue'
                            : inputsDisabled
                              ? 'bg-transparent border-white/10 text-white/30 cursor-default'
                              : 'bg-union-navy border-union-blue/30 text-white/60 hover:text-white hover:border-union-blue/60'
                        )}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    ref={homeRef}
                    data-batch-input="home"
                    data-match-id={match.id}
                    type="number" min="0" max="9"
                    value={home}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 1)
                      handleHomeChange(v)
                      if (v !== '' && batchMode) {
                        if (away === '') {
                          awayRef.current?.focus()
                          awayRef.current?.select()
                        } else {
                          const allHomes = Array.from(document.querySelectorAll<HTMLInputElement>('[data-batch-input="home"]:not(:disabled)'))
                          const next = allHomes[allHomes.indexOf(homeRef.current!) + 1]
                          if (next) { next.focus(); next.select() }
                        }
                      }
                    }}
                    disabled={inputsDisabled}
                    className={cn(
                      'w-10 h-9 text-center rounded text-sm focus:outline-none focus:ring-1 focus:ring-union-blue placeholder:text-white/25 transition-colors',
                      inputsDisabled
                        ? 'bg-transparent border border-white/10 text-white/50 cursor-default'
                        : 'bg-union-navy border border-union-blue/30 text-white cursor-text'
                    )}
                    placeholder="-"
                  />
                  <span className="text-white/30 text-xs">-</span>
                  <input
                    ref={awayRef}
                    data-batch-input="away"
                    data-match-id={match.id}
                    type="number" min="0" max="9"
                    value={away}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 1)
                      handleAwayChange(v)
                      if (v !== '' && batchMode) {
                        const allHomes = Array.from(document.querySelectorAll<HTMLInputElement>('[data-batch-input="home"]:not(:disabled)'))
                        const next = allHomes[allHomes.indexOf(homeRef.current!) + 1]
                        if (next) { next.focus(); next.select() }
                      }
                    }}
                    disabled={inputsDisabled}
                    className={cn(
                      'w-10 h-9 text-center rounded text-sm focus:outline-none focus:ring-1 focus:ring-union-blue placeholder:text-white/25 transition-colors',
                      inputsDisabled
                        ? 'bg-transparent border border-white/10 text-white/50 cursor-default'
                        : 'bg-union-navy border border-union-blue/30 text-white cursor-text'
                    )}
                    placeholder="-"
                  />
                </div>
              )}

              {/* Penalty picker */}
              {showPenaltyPicker && (
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <span className="text-xs text-yellow-400 font-semibold text-center">¿Quién gana en penales?</span>
                  <div className="flex gap-1.5 w-full justify-center">
                    {(['home', 'away'] as PenaltyWinner[]).map((side) => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => setPenaltyPred(side)}
                        className={cn(
                          'flex-1 max-w-[90px] px-2 py-1 rounded-md text-xs font-semibold transition-colors border truncate',
                          penaltyPred === side
                            ? 'bg-union-blue text-white border-union-blue'
                            : 'bg-union-navy border-union-blue/30 text-white/60 hover:text-white hover:border-union-blue/60'
                        )}
                      >
                        {side === 'home' ? match.home_team : match.away_team}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Committed penalty badge */}
              {showPenaltyBadge && (
                <button
                  type="button"
                  onClick={() => { setCommittedPenalty(null); setPenaltyPred(committedPenalty) }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/30 rounded-full text-xs text-yellow-400 font-semibold hover:bg-yellow-500/25 transition-colors"
                >
                  🥅 Pen: {committedPenalty === 'home' ? match.home_team : match.away_team}
                </button>
              )}

              {/* Saved penalty (view mode) */}
              {inputsDisabled && prediction?.penalty_pred && (
                <span className="text-xs text-white/40">
                  Pen: {prediction.penalty_pred === 'home' ? match.home_team : match.away_team}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <TeamBadge flag={match.away_flag} teamName={match.away_team} />
          <span className="text-sm font-semibold text-white text-center leading-tight">{match.away_team}</span>
        </div>
      </div>

      {/* Banner EN VIVO — solo cuando el partido se está jugando */}
      {match.status === 'live' && match.home_score !== null && match.away_score !== null && (
        <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <span className="text-xs font-semibold text-white/60 truncate flex-1">{match.home_team}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-base font-bold text-white tabular-nums">{match.home_score}</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              En vivo
            </span>
            <span className="text-base font-bold text-white tabular-nums">{match.away_score}</span>
          </div>
          <span className="text-xs font-semibold text-white/60 truncate flex-1 text-right">{match.away_team}</span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-union-blue/10 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            {pointsBadge ? (
              <span className={cn('text-xs font-bold px-2 py-0.5 rounded', pointsBadge.cls)}>
                {pointsBadge.label}
              </span>
            ) : match.venue ? (
              <span className="text-xs text-white/25 truncate block">{match.venue}</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!batchMode && isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                <X size={13} /> Cancelar
              </button>
            )}

            {!batchMode && !locked && !phaseLocked && (
              prediction && !isEditing ? (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  {saved
                    ? <><CheckCircle2 size={13} className="mr-1" /> Guardado</>
                    : <><Pencil size={13} className="mr-1" /> Modificar pronóstico</>}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSave}
                  loading={upsert.isPending}
                  disabled={
                    mode1X2
                      ? selectedOutcome === null || (penaltyRequired && penaltyPred === null && committedPenalty === null)
                      : (!home && !away) || (penaltyRequired && penaltyPred === null && committedPenalty === null)
                  }
                >
                  {saved
                    ? <><CheckCircle2 size={14} className="mr-1" /> Guardado</>
                    : 'Guardar'}
                </Button>
              )
            )}

            {!batchMode && phaseLocked && (
              <Button size="sm" disabled>Guardar</Button>
            )}
          </div>
        </div>

        {/* Deadline / locked hint — solo en modo individual */}
        {!batchMode && !locked && !phaseLocked && lockAt && (
          <p className="text-[10px] text-white/25 text-right">
            Modificable hasta el {formatLockDeadline(lockAt)}
          </p>
        )}
        {locked && prediction && (
          <p className="text-[10px] text-white/25 text-right italic">Pronóstico cerrado</p>
        )}
      </div>
    </Card>

    {/* Warning modal: diferencia abultada */}
    {showWarn && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="bg-union-navy border border-union-blue/20 rounded-2xl p-6 max-w-sm w-full shadow-xl">
          <p className="text-white font-bold text-lg mb-2">⚠️ Resultado muy abultado</p>
          <p className="text-white/60 text-sm mb-5">
            Estás pronosticando una diferencia de {Math.abs(hVal - aVal)} goles. ¿Seguro que querés guardar igual?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowWarn(false)}
              className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white transition-colors"
            >
              Corregir
            </button>
            <button
              onClick={() => { setShowWarn(false); doSave() }}
              className="px-4 py-2 rounded-lg text-sm bg-union-blue text-white font-semibold hover:bg-union-blue/80 transition-colors"
            >
              Guardar igual
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}
