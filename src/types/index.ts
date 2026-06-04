export type MatchStage = 'group' | 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'third_place' | 'final'
export type MatchStatus = 'upcoming' | 'live' | 'finished'
export type TournamentKind = 'global' | 'friends'
export type PenaltyWinner = 'home' | 'away'
export type ShowRivalPredictions = 'before' | 'after'

export const KNOCKOUT_STAGES: MatchStage[] = [
  'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final',
]

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  is_organizer: boolean
  free_pass: boolean
  created_at: string
}

export interface Match {
  id: string
  group_name: string | null
  stage: MatchStage
  match_number: number
  home_team: string
  away_team: string
  home_flag: string | null
  away_flag: string | null
  match_date: string
  venue: string | null
  home_score: number | null
  away_score: number | null
  penalty_winner: PenaltyWinner | null
  status: MatchStatus
  competition: string
  created_at: string
}

export interface TournamentRules {
  pts_exact: number
  pts_outcome: number
  pts_penalty_correct: number
  pts_penalty_wrong_deduct: number
  pts_penalty_wrong_deduct_draw_outcome: number
  requires_exact_score: boolean
}

export const DEFAULT_RULES: TournamentRules = {
  pts_exact: 3,
  pts_outcome: 1,
  pts_penalty_correct: 1,
  pts_penalty_wrong_deduct: 1,
  pts_penalty_wrong_deduct_draw_outcome: 0,
  requires_exact_score: true,
}

export const SPECIAL_PREDICTION_POINTS = 2  // pts por cada acierto en predicciones especiales

export interface TournamentTypePublic {
  id: string
  name: string
  description: string | null
  pts_exact: number
  pts_outcome: number
  pts_penalty_correct: number
  pts_penalty_wrong_deduct: number
  pts_penalty_wrong_deduct_draw_outcome: number
  requires_exact_score: boolean
  prediction_lock_hours: number
  show_rival_predictions: ShowRivalPredictions
  is_active: boolean
  created_at: string
}

export interface TournamentTypeAdmin extends TournamentTypePublic {
  club_fee_percentage: number
}

export interface Tournament {
  id: string
  name: string
  type: TournamentKind
  invite_code: string | null
  created_by: string | null
  entry_fee: number
  prize_pool: number
  is_active: boolean
  competition: string | null
  rules: TournamentRules
  tournament_type_id: string | null
  prediction_lock_hours: number
  show_rival_predictions: ShowRivalPredictions
  has_special_predictions: boolean
  actual_champion?: string | null
  actual_top_scorer?: string | null
  actual_best_player?: string | null
  has_corazonada: boolean
  pts_corazonada_bonus: number
  created_at: string
  member_count?: number
  user_joined?: boolean
  user_paid?: boolean
}

export interface Corazonada {
  id: string
  user_id: string
  tournament_id: string
  match_id: string
  group_name: string | null   // grupo al que pertenece (A-L); null para fases eliminatorias
  points_earned: number
  created_at: string
  updated_at: string
}

export interface SpecialPrediction {
  id: string
  user_id: string
  tournament_id: string
  champion_team: string | null
  top_scorer: string | null
  best_player: string | null
  points_earned: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  tournament_id: string
  mp_preference_id: string | null
  mp_payment_id: string | null
  amount: number
  currency: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface TournamentMember {
  id: string
  tournament_id: string
  user_id: string
  paid: boolean
  joined_at: string
  profile?: Profile
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  tournament_id: string
  home_score_pred: number
  away_score_pred: number
  penalty_pred: PenaltyWinner | null
  points_earned: number
  created_at: string
  updated_at: string
  match?: Match
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  total_points: number
  exact_scores: number
  correct_outcomes: number
  total_predictions: number
  corazonadas_acertadas?: number
  rank: number
}

export interface AuthUser {
  id: string
  email: string | null
  profile: Profile | null
}
