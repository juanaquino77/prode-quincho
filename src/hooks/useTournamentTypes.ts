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
      const { data, error } = await supabase.rpc('admin_list_tournament_types')
      if (error) throw error
      return data as TournamentTypeAdmin[]
    },
  })
}

export function useUpsertTournamentType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (t: Omit<TournamentTypeAdmin, 'id' | 'created_at'> & { id?: string }) => {
      const { data, error } = await supabase.rpc('admin_upsert_tournament_type', {
        p_id:                                    t.id ?? null,
        p_name:                                  t.name,
        p_description:                           t.description ?? null,
        p_pts_exact:                             t.pts_exact,
        p_pts_outcome:                           t.pts_outcome,
        p_pts_penalty_correct:                   t.pts_penalty_correct,
        p_pts_penalty_wrong_deduct:              t.pts_penalty_wrong_deduct,
        p_pts_penalty_wrong_deduct_draw_outcome: t.pts_penalty_wrong_deduct_draw_outcome,
        p_requires_exact_score:                  t.requires_exact_score,
        p_prediction_lock_hours:                 t.prediction_lock_hours,
        p_show_rival_predictions:                t.show_rival_predictions,
        p_club_fee_percentage:                   t.club_fee_percentage,
        p_is_active:                             t.is_active,
      })
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
      const { error } = await supabase.rpc('admin_toggle_tournament_type_active', {
        p_id: id,
        p_is_active: is_active,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournament-types-admin'] })
      qc.invalidateQueries({ queryKey: ['tournament-types-public'] })
    },
  })
}
