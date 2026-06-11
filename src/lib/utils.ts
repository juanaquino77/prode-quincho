import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { parseISO, isPast, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Match, MatchStage, PenaltyWinner } from '../types'
import { KNOCKOUT_STAGES } from '../types'

// Argentina es siempre UTC-3 (sin horario de verano).
// Devuelve un Date que, formateado con date-fns format(), muestra la hora argentina
// independientemente del timezone del browser.
function toARDisplay(date: Date): Date {
  return new Date(
    date.getTime()
    - 3 * 3_600_000              // llevar a UTC-3
    + date.getTimezoneOffset() * 60_000  // compensar el offset local del browser
  )
}

// Mapeo día en español → getDay() (0=Domingo)
const DAY_OF_WEEK: Record<string, number> = {
  Lunes: 1, Martes: 2, 'Miércoles': 3, Jueves: 4,
  Viernes: 5, 'Sábado': 6, Domingo: 0,
}

// Abreviatura usada en el DB → stage enum (formato legacy)
const STAGE_ABBREV: Record<string, MatchStage> = {
  O:  'round_of_16',
  CF: 'quarterfinal',
  SF: 'semifinal',
}

/**
 * Devuelve el placeholder canónico que referencia a este partido
 * en la siguiente ronda: "Gan. #N" donde N es el match_number.
 * Retorna null si el partido no tiene match_number (no debería pasar).
 */
export function getMatchPlaceholder(match: Match): string | null {
  if (match.match_number == null) return null
  return `Gan. #${match.match_number}`
}

/**
 * Dado un placeholder, encuentra el partido siguiente que lo tiene como
 * home_team o away_team, y retorna el campo a actualizar.
 */
export function findNextMatch(
  placeholder: string,
  allMatches: Match[]
): { match: Match; field: 'home_team' | 'away_team' } | null {
  for (const m of allMatches) {
    if (m.home_team === placeholder) return { match: m, field: 'home_team' }
    if (m.away_team === placeholder) return { match: m, field: 'away_team' }
  }
  return null
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMatchDate(dateStr: string) {
  return format(parseISO(dateStr), "d 'de' MMMM, HH:mm", { locale: es })
}

export function formatShortDate(dateStr: string) {
  return format(toARDisplay(parseISO(dateStr)), 'd MMM HH:mm', { locale: es })
}

/** Returns the deadline string for modifying a prediction */
export function formatLockDeadline(lockAt: Date): string {
  return format(toARDisplay(lockAt), "d MMM · HH:mm 'hs'", { locale: es })
}

export function isMatchLocked(match: Match, lockAt?: Date): boolean {
  if (match.status !== 'upcoming') return true
  const deadline = lockAt ?? new Date(parseISO(match.match_date).getTime())
  return isPast(deadline)
}

/**
 * Calcula el momento a partir del cual se bloquean los pronósticos
 * de un partido, basado en el primer partido de su ronda.
 */
export function computeRoundLockAt(
  match: Match,
  allMatches: Match[],
  lockHours: number,
): Date {
  const sameRound = allMatches.filter(
    (m) =>
      m.stage === match.stage &&
      (match.stage !== 'group' || m.group_name === match.group_name),
  )
  const earliest = Math.min(...sameRound.map((m) => parseISO(m.match_date).getTime()))
  return new Date(earliest - lockHours * 3600_000)
}

export function calcPoints(
  match: Match,
  homePred: number,
  awayPred: number,
  penaltyPred?: PenaltyWinner | null,
  rules?: { pts_exact?: number; pts_outcome?: number; pts_penalty_correct?: number; pts_penalty_wrong_deduct?: number; pts_penalty_wrong_deduct_draw_outcome?: number; requires_exact_score?: boolean },
): number {
  if (match.home_score === null || match.away_score === null) return 0

  const pts_exact    = rules?.pts_exact    ?? 3
  const pts_outcome  = rules?.pts_outcome  ?? 1
  const pts_penalty_correct                   = rules?.pts_penalty_correct                   ?? 1
  const pts_penalty_wrong_deduct              = rules?.pts_penalty_wrong_deduct              ?? 1
  const pts_penalty_wrong_deduct_draw_outcome = rules?.pts_penalty_wrong_deduct_draw_outcome ?? 0
  const requires_exact_score                  = rules?.requires_exact_score                  ?? true

  const exact = match.home_score === homePred && match.away_score === awayPred
  const correctOutcome =
    Math.sign(match.home_score - match.away_score) === Math.sign(homePred - awayPred)

  if (!exact && !correctOutcome) return 0

  // En modo 1X2 (requires_exact_score = false), exacto cuenta como outcome
  let pts = (exact && requires_exact_score) ? pts_exact : pts_outcome

  const isKnockout = KNOCKOUT_STAGES.includes(match.stage)
  const actualDraw = match.home_score === match.away_score
  const predDraw   = homePred === awayPred

  if (isKnockout && actualDraw && predDraw && match.penalty_winner != null && penaltyPred != null) {
    if (penaltyPred === match.penalty_winner) {
      pts += pts_penalty_correct
    } else if (exact && requires_exact_score) {
      pts -= pts_penalty_wrong_deduct
    } else {
      pts -= pts_penalty_wrong_deduct_draw_outcome
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

/**
 * Resuelve tres formatos de placeholder de equipo:
 *
 * Formato 0 — "Gan. #N"  (canónico — recomendado)
 *   Busca el partido con match_number = N.
 *   - Si terminó → devuelve al ganador.
 *   - Si no terminó → devuelve "EquipoA o EquipoB" si ambos son concretos.
 *
 * Formato 1 — "Gan. X o Y"
 *   Busca el partido terminado donde jugaron X e Y y devuelve al ganador.
 *
 * Formato 2 — "Gan. CF Martes 1" / "Gan. SF Jueves 2" etc. (legacy)
 *   Busca el N-ésimo partido de esa etapa en ese día de la semana.
 */
export function resolveTeamName(name: string, allMatches: Match[]): string {
  // ── Formato 0: "Gan. #N" ──────────────────────────────────────────────────
  const m0 = name.match(/^Gan\.\s+#(\d+)$/)
  if (m0) {
    const matchNum = parseInt(m0[1])
    const feeder = allMatches.find((pm) => pm.match_number === matchNum)
    if (!feeder) return name
    if (feeder.home_score !== null && feeder.away_score !== null) {
      const homeWins = feeder.penalty_winner === 'home' || feeder.home_score > feeder.away_score
      return homeWins ? feeder.home_team : feeder.away_team
    }
    const rHome = resolveTeamName(feeder.home_team, allMatches)
    const rAway = resolveTeamName(feeder.away_team, allMatches)
    if (!rHome.includes(' o ') && !rAway.includes(' o ')) return `${rHome} o ${rAway}`
    return name
  }

  // ── Formato 2: "Gan. ABBREV DíaSemana N" (legacy) ─────────────────────────
  const m2 = name.match(/^Gan\.\s+([A-Z]+)\s+(\S+)\s+(\d+)$/)
  if (m2) {
    const [, abbrev, dayStr, idxStr] = m2
    const stage = STAGE_ABBREV[abbrev]
    const dayNum = DAY_OF_WEEK[dayStr]
    if (stage === undefined || dayNum === undefined) return name

    const idx = parseInt(idxStr) - 1
    const stageMatches = allMatches
      .filter((pm) => pm.stage === stage && new Date(pm.match_date).getDay() === dayNum)
      .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

    const feeder = stageMatches[idx]
    if (!feeder) return name

    // Partido terminado → devolver ganador
    if (feeder.home_score !== null && feeder.away_score !== null) {
      const homeWins = feeder.penalty_winner === 'home' || feeder.home_score! > feeder.away_score!
      return homeWins ? feeder.home_team : feeder.away_team
    }

    // Partido no terminado → resolver ambos equipos y mostrar opciones
    const rHome = resolveTeamName(feeder.home_team, allMatches)
    const rAway = resolveTeamName(feeder.away_team, allMatches)
    // Solo mostrar "X o Y" si ambos son nombres concretos (sin " o " anidados)
    if (!rHome.includes(' o ') && !rAway.includes(' o ')) {
      return `${rHome} o ${rAway}`
    }
    return name
  }

  // ── Formato 1: "Gan. X o Y" ───────────────────────────────────────────────
  const m1 = name.match(/^Gan\.\s+(.+?)\s+o\s+(.+)$/)
  if (m1) {
    const [, partA, partB] = m1
    const feeder = allMatches.find(
      (pm) =>
        pm.home_score !== null &&
        pm.away_score !== null &&
        (pm.home_team.includes(partA) || pm.away_team.includes(partA)) &&
        (pm.home_team.includes(partB) || pm.away_team.includes(partB))
    )
    if (!feeder) return name
    const homeWins = feeder.penalty_winner === 'home' || feeder.home_score! > feeder.away_score!
    return homeWins ? feeder.home_team : feeder.away_team
  }

  return name
}

export function resolveMatches(matches: Match[]): Match[] {
  return matches.map((m) => ({
    ...m,
    home_team: resolveTeamName(m.home_team, matches),
    away_team: resolveTeamName(m.away_team, matches),
  }))
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function getOutcomeLabel(homeScore: number, awayScore: number, homeTeam: string, awayTeam: string): string {
  if (homeScore > awayScore) return `Gana ${homeTeam}`
  if (awayScore > homeScore) return `Gana ${awayTeam}`
  return 'Empate'
}
