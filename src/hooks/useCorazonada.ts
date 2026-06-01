import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Corazonada } from '../types'

/** Devuelve todas las corazonadas del usuario para un torneo (1 por grupo) */
export function useCorazonadas(userId: string | undefined, tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['corazonadas', userId, tournamentId],
    enabled: !!userId && !!tournamentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corazonadas')
        .select('*')
        .eq('user_id', userId!)
        .eq('tournament_id', tournamentId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Corazonada[]
    },
  })
}

/** Marca un partido como corazonada de su grupo (upsert por grupo) */
export function useAddCorazonada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      user_id: string
      tournament_id: string
      match_id: string
      group_name: string | null
    }) => {
      const { data, error } = await supabase
        .from('corazonadas')
        .upsert(payload, { onConflict: 'user_id,tournament_id,group_name' })
        .select()
        .single()
      if (error) throw error
      return data as Corazonada
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['corazonadas', vars.user_id, vars.tournament_id] })
    },
  })
}

/** Quita la corazonada de un partido específico */
export function useRemoveCorazonada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      user_id: string
      tournament_id: string
      match_id: string
    }) => {
      const { error } = await supabase
        .from('corazonadas')
        .delete()
        .eq('user_id', payload.user_id)
        .eq('tournament_id', payload.tournament_id)
        .eq('match_id', payload.match_id)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['corazonadas', vars.user_id, vars.tournament_id] })
    },
  })
}
