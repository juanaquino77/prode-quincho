import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Corazonada } from '../types'

export function useCorazonada(userId: string | undefined, tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['corazonada', userId, tournamentId],
    enabled: !!userId && !!tournamentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corazonadas')
        .select('*')
        .eq('user_id', userId!)
        .eq('tournament_id', tournamentId!)
        .maybeSingle()
      if (error) throw error
      return data as Corazonada | null
    },
  })
}

export function useSetCorazonada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      user_id: string
      tournament_id: string
      match_id: string
    }) => {
      const { data, error } = await supabase
        .from('corazonadas')
        .upsert(payload, { onConflict: 'user_id,tournament_id' })
        .select()
        .single()
      if (error) throw error
      return data as Corazonada
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['corazonada', vars.user_id, vars.tournament_id] })
    },
  })
}

export function useClearCorazonada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { user_id: string; tournament_id: string }) => {
      const { error } = await supabase
        .from('corazonadas')
        .delete()
        .eq('user_id', payload.user_id)
        .eq('tournament_id', payload.tournament_id)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['corazonada', vars.user_id, vars.tournament_id] })
    },
  })
}
