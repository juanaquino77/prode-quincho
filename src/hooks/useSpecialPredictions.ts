import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { SpecialPrediction } from '../types'

export function useSpecialPredictions(userId: string | undefined, tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['special_predictions', userId, tournamentId],
    enabled: !!userId && !!tournamentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_predictions')
        .select('*')
        .eq('user_id', userId!)
        .eq('tournament_id', tournamentId!)
        .maybeSingle()
      if (error) throw error
      return data as SpecialPrediction | null
    },
  })
}

export function useUpsertSpecialPrediction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pred: {
      user_id: string
      tournament_id: string
      champion_team: string | null
      top_scorer: string | null
      best_player: string | null
    }) => {
      const { data, error } = await supabase
        .from('special_predictions')
        .upsert(pred, { onConflict: 'user_id,tournament_id' })
        .select()
        .single()
      if (error) throw error
      return data as SpecialPrediction
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['special_predictions', vars.user_id, vars.tournament_id] })
    },
  })
}
