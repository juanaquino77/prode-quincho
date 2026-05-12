import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { TournamentTypePublic, TournamentTypeAdmin } from '../types'

export function useTournamentTypesPublic() {
  return useQuery({
    queryKey: ['tournament-types-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournament_types_public')
        .select('*')
        .order('name')
      if (error) throw error
      return data as TournamentTypePublic[]
    },
  })
}

export function useAdminTournamentTypes() {
  return useQuery({
    queryKey: ['tournament-types-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournament_types')
        .select('*')
        .order('name')
      if (error) throw error
      return data as TournamentTypeAdmin[]
    },
  })
}

export function useUpsertTournamentType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (t: Omit<TournamentTypeAdmin, 'id' | 'created_at'> & { id?: string }) => {
      const { id, ...fields } = t
      if (id) {
        const { data, error } = await supabase
          .from('tournament_types')
          .update(fields)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data as TournamentTypeAdmin
      }
      const { data, error } = await supabase
        .from('tournament_types')
        .insert(fields)
        .select()
        .single()
      if (error) throw error
      return data as TournamentTypeAdmin
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournament-types-admin'] })
      qc.invalidateQueries({ queryKey: ['tournament-types-public'] })
    },
  })
}

export function useToggleTournamentTypeActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('tournament_types')
        .update({ is_active })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournament-types-admin'] })
      qc.invalidateQueries({ queryKey: ['tournament-types-public'] })
    },
  })
}
