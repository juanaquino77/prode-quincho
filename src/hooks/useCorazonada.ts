import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Corazonada } from '../types'

export const CORAZONADA_MAX = 3

/** Devuelve todas las corazonadas del usuario para un torneo (máximo 3) */
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

/** Agrega un partido como corazonada (máximo 3 por torneo, validado en DB) */
export function useAddCorazonada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      user_id: string
      tournament_id: string
      match_id: string
    }) => {
      const { data, error } = await supabase
        .from('corazonadas')
        .insert(payload)
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
