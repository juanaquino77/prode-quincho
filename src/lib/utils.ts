import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Match, PenaltyWinner } from '../types'
import { KNOCKOUT_STAGES } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMatchDate(dateStr: string) {
  return format(parseISO(dateStr), "d 'de' MMMM, HH:mm", { locale: es })
}

export function formatShortDate(dateStr: string) {
  return format(parseISO(dateStr), 'd MMM HH:mm', { locale: es })
}

/** Returns the deadline string for modifying a prediction, e.g. "hasta el 12 may · 13:00 hs" */
export function formatLockDeadline(matchDateStr: string): string {
  const kickOff = parseISO(matchDateStr)
  const lockAt = new Date(kickOff.getTime() - 2 * 60 * 60 * 1000)
  return format(lockAt, "d MMM · HH:mm 'hs'", { locale: es })
}

export function isMatchLocked(match: Match): boolean {
  if (match.status !== 'upcoming') return true
  // Lock predictions 2 hours before kick-off
  const kickOff = parseISO(match.match_date)
  const lockAt = new Date(kickOff.getTime() - 2 * 60 * 60 * 1000)
  return isPast(lockAt)
}

export function calcPoints(
  match: Match,
  homePred: number,
  awayPred: number,
  penaltyPred?: PenaltyWinner | null,
): number {
  if (match.home_score === null || match.away_score === null) return 0

  const exact = match.home_score === homePred && match.away_score === awayPred
  const correctOutcome =
    Math.sign(match.home_score - match.away_score) === Math.sign(homePred - awayPred)

  if (!exact && !correctOutcome) return 0

  let pts = exact ? 3 : 1

  const isKnockout = KNOCKOUT_STAGES.includes(match.stage)
  const actualDraw = match.home_score === match.away_score
  const predDraw = homePred === awayPred

  if (
    isKnockout &&
    actualDraw &&
    predDraw &&
    match.penalty_winner != null &&
    penaltyPred != null
  ) {
    if (penaltyPred === match.penalty_winner) {
      pts += 1
    } else if (exact) {
      pts -= 1 // deduction only on exact score, not on correct-outcome-only
    }
  }

  return pts
}

export function getStageName(stage: string): string {
  const map: Record<string, string> = {
    group: 'Fase de Grupos',
    round_of_32: 'Ronda de 32',
    round_of_16: 'Octavos de Final',
    quarterfinal: 'Cuartos de Final',
    semifinal: 'Semifinal',
    third_place: 'Tercer Puesto',
    final: 'Final',
  }
  return map[stage] ?? stage
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function getOutcomeLabel(homeScore: number, awayScore: number, homeTeam: string, awayTeam: string): string {
  if (homeScore > awayScore) return `Gana ${homeTeam}`
  if (awayScore > homeScore) return `Gana ${awayTeam}`
  return 'Empate'
}
