import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Prediction } from '../types'

export interface TournamentWithPredictionCount {
  id: string
  name: string
  type: string
  prediction_count: number
}

export function usePredictions(userId: string | undefined, tournamentId: string) {
  return useQuery({
    queryKey: ['predictions', userId, tournamentId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('*, match:matches(*)')
        .eq('user_id', userId!)
        .eq('tournament_id', tournamentId)
      if (error) throw error
      return data as Prediction[]
    },
  })
}

export function useUserTournamentsWithPredictions(
  userId: string | undefined,
  excludeId: string | undefined
) {
  return useQuery({
    queryKey: ['user-tournaments-predictions', userId, excludeId],
    enabled: !!userId && !!excludeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('tournament_id')
        .eq('user_id', userId!)
        .neq('tournament_id', excludeId!)
      if (error) throw error
      if (!data?.length) return []

      const counts: Record<string, number> = {}
      for (const p of data) {
        counts[p.tournament_id] = (counts[p.tournament_id] || 0) + 1
      }

      const ids = Object.keys(counts)
      const { data: tournaments, error: tErr } = await supabase
        .from('tournaments')
        .select('id, name, type')
        .in('id', ids)
      if (tErr) throw tErr

      return (tournaments || [])
        .map((t) => ({ ...t, prediction_count: counts[t.id] || 0 }))
        .sort((a, b) => b.prediction_count - a.prediction_count) as TournamentWithPredictionCount[]
    },
  })
}

export function useCopyPredictions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      userId,
      sourceTournamentId,
      targetTournamentId,
    }: {
      userId: string
      sourceTournamentId: string
      targetTournamentId: string
    }) => {
      const { data, error } = await supabase.rpc('copy_predictions', {
        p_user_id: userId,
        p_source_tournament_id: sourceTournamentId,
        p_target_tournament_id: targetTournamentId,
      })
      if (error) throw error
      return data as number
    },
    onSuccess: (_count, vars) => {
      qc.invalidateQueries({ queryKey: ['predictions', vars.userId, vars.targetTournamentId] })
    },
  })
}

export function useUpsertPrediction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pred: {
      user_id: string
      match_id: string
      tournament_id: string
      home_score_pred: number
      away_score_pred: number
      penalty_pred?: 'home' | 'away' | null
    }) => {
      const { data, error } = await supabase
        .from('predictions')
        .upsert(pred, { onConflict: 'user_id,match_id,tournament_id' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['predictions', vars.user_id, vars.tournament_id] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}
