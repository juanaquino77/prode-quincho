import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tournament, LeaderboardEntry } from '../types'
import { generateInviteCode } from '../lib/utils'

export function useTournaments() {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, tournament_members(count)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map((t: Tournament & { tournament_members: { count: number }[] }) => ({
        ...t,
        member_count: t.tournament_members?.[0]?.count ?? 0,
      })) as Tournament[]
    },
  })
}

export function useUserTournaments(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-tournaments', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournament_members')
        .select('tournament:tournaments(*, tournament_members(count))')
        .eq('user_id', userId!)
      if (error) throw error
      return data
        .map((row: { tournament: Tournament & { tournament_members: { count: number }[] } }) => ({
          ...row.tournament,
          member_count: row.tournament.tournament_members?.[0]?.count ?? 0,
        }))
        .filter(Boolean) as Tournament[]
    },
  })
}

export function useGlobalTournament() {
  return useQuery({
    queryKey: ['global-tournament'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('type', 'global')
        .eq('is_active', true)
        .single()
      if (error) return null
      return data as Tournament
    },
  })
}

export function useCreateTournament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (t: {
      name: string
      entry_fee: number
      club_fee_percentage: number
      created_by: string
    }) => {
      const invite_code = generateInviteCode()
      const { data, error } = await supabase
        .from('tournaments')
        .insert({ ...t, type: 'friends', invite_code })
        .select()
        .single()
      if (error) throw error
      // auto-join creator
      await supabase.from('tournament_members').insert({
        tournament_id: data.id,
        user_id: t.created_by,
        paid: t.entry_fee === 0,
      })
      return data as Tournament
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournaments'] })
      qc.invalidateQueries({ queryKey: ['user-tournaments'] })
    },
  })
}

export function useJoinTournament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, inviteCode }: { userId: string; inviteCode: string }) => {
      const { data: tournament, error: tErr } = await supabase
        .from('tournaments')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single()
      if (tErr || !tournament) throw new Error('Código inválido o torneo no encontrado')

      const { error } = await supabase.from('tournament_members').insert({
        tournament_id: tournament.id,
        user_id: userId,
        paid: tournament.entry_fee === 0,
      })
      if (error) throw new Error('Ya estás en este torneo o hubo un error')
      return tournament as Tournament
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournaments'] })
      qc.invalidateQueries({ queryKey: ['user-tournaments'] })
    },
  })
}

export function useLeaderboard(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['leaderboard', tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        p_tournament_id: tournamentId,
      })
      if (error) throw error
      return data as LeaderboardEntry[]
    },
  })
}
