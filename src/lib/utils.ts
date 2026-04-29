import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Match } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMatchDate(dateStr: string) {
  return format(parseISO(dateStr), "d 'de' MMMM, HH:mm", { locale: es })
}

export function formatShortDate(dateStr: string) {
  return format(parseISO(dateStr), 'd MMM HH:mm', { locale: es })
}

export function isMatchLocked(match: Match): boolean {
  return isPast(parseISO(match.match_date)) || match.status !== 'upcoming'
}

export function calcPoints(match: Match, homePred: number, awayPred: number): number {
  if (match.home_score === null || match.away_score === null) return 0

  const exactScore = match.home_score === homePred && match.away_score === awayPred
  if (exactScore) return 2

  const actualOutcome = Math.sign(match.home_score - match.away_score)
  const predOutcome = Math.sign(homePred - awayPred)
  return actualOutcome === predOutcome ? 1 : 0
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
