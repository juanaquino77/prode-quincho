import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Prediction } from '../types'

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

export function useUpsertPrediction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pred: {
      user_id: string
      match_id: string
      tournament_id: string
      home_score_pred: number
      away_score_pred: number
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
