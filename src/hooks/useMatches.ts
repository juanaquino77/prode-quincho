import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Match } from '../types'

export function useMatches(stage?: string) {
  return useQuery({
    queryKey: ['matches', stage],
    queryFn: async () => {
      let query = supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true })
      if (stage) query = query.eq('stage', stage)
      const { data, error } = await query
      if (error) throw error
      return data as Match[]
    },
  })
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Match
    },
  })
}

export function useUpsertMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (match: Partial<Match>) => {
      const { data, error } = await supabase.from('matches').upsert(match).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}

export function useDeleteMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('matches').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}
