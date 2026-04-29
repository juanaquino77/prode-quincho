export type MatchStage = 'group' | 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'third_place' | 'final'
export type MatchStatus = 'upcoming' | 'live' | 'finished'
export type TournamentType = 'global' | 'friends'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
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
  status: MatchStatus
  created_at: string
}

export interface Tournament {
  id: string
  name: string
  type: TournamentType
  invite_code: string | null
  created_by: string | null
  entry_fee: number
  prize_pool: number
  club_fee_percentage: number
  is_active: boolean
  created_at: string
  member_count?: number
  user_joined?: boolean
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
  rank: number
}

export interface AuthUser {
  id: string
  email: string | null
  profile: Profile | null
}
