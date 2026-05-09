import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tournament, TournamentRules, LeaderboardEntry, Payment } from '../types'
import { DEFAULT_RULES } from '../types'
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
        .select('paid, tournament:tournaments(*, tournament_members(count))')
        .eq('user_id', userId!)
      if (error) throw error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[])
        .map((row) => {
          const t = row.tournament as Tournament & { tournament_members: { count: number }[] }
          if (!t) return null
          return {
            ...t,
            member_count: t.tournament_members?.[0]?.count ?? 0,
            user_paid: row.paid as boolean,
          }
        })
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
      competition?: string | null
      rules?: TournamentRules
    }) => {
      const invite_code = generateInviteCode()
      const { data, error } = await supabase
        .from('tournaments')
        .insert({ ...t, type: 'friends', invite_code, rules: t.rules ?? DEFAULT_RULES })
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

export function useDeleteTournament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournaments'] })
      qc.invalidateQueries({ queryKey: ['user-tournaments'] })
      qc.invalidateQueries({ queryKey: ['global-tournament'] })
    },
  })
}

export function useLeaderboard(tournamentId: string | undefined, hasLive = false) {
  return useQuery({
    queryKey: ['leaderboard', tournamentId],
    enabled: !!tournamentId,
    refetchInterval: hasLive ? 30_000 : false,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        p_tournament_id: tournamentId,
      })
      if (error) throw error
      return data as LeaderboardEntry[]
    },
  })
}

export function useUserPayment(userId: string | undefined, tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['payment', userId, tournamentId],
    enabled: !!userId && !!tournamentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId!)
        .eq('tournament_id', tournamentId!)
        .maybeSingle()
      if (error) throw error
      return data as Payment | null
    },
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { tournament_id: tournamentId },
      })
      if (error) throw error
      return data as { init_point: string; sandbox_init_point: string }
    },
    onSuccess: (_, tournamentId) => {
      qc.invalidateQueries({ queryKey: ['payment'] })
      qc.invalidateQueries({ queryKey: ['user-tournaments'] })
      qc.invalidateQueries({ queryKey: ['tournaments', tournamentId] })
    },
  })
}
