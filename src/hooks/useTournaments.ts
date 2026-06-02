import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tournament, LeaderboardEntry, Payment } from '../types'

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
      // Paso 1: obtener IDs de torneos del usuario con paid
      const { data: members, error: mErr } = await supabase
        .from('tournament_members')
        .select('paid, tournament_id')
        .eq('user_id', userId!)
      if (mErr) throw mErr
      if (!members?.length) return []

      const ids = members.map((m) => m.tournament_id as string)
      const paidMap = Object.fromEntries(members.map((m) => [m.tournament_id, m.paid]))

      // Paso 2: query tournaments (sin club_fee_percentage)
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, tournament_members(count)')
        .in('id', ids)
      if (error) throw error

      return data.map((t: Tournament & { tournament_members: { count: number }[] }) => ({
        ...t,
        member_count: t.tournament_members?.[0]?.count ?? 0,
        user_paid: paidMap[t.id] as boolean,
      })) as Tournament[]
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
      tournament_type_id: string
      created_by: string
      competition: string
      has_special_predictions?: boolean
      has_corazonada?: boolean
    }) => {
      const { data, error } = await supabase.rpc('create_tournament', {
        p_name: t.name,
        p_entry_fee: t.entry_fee,
        p_tournament_type_id: t.tournament_type_id,
        p_competition: t.competition,
        p_created_by: t.created_by,
      })
      if (error) throw error
      const tournament = data as Tournament
      // Persist feature flags if enabled (default is false in DB)
      const updates: Record<string, boolean> = {}
      if (t.has_special_predictions) updates.has_special_predictions = true
      if (t.has_corazonada) updates.has_corazonada = true
      if (Object.keys(updates).length > 0) {
        await supabase.from('tournaments').update(updates).eq('id', tournament.id)
      }
      return tournament
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

export function useAutoEnrollGlobal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase
        .from('tournament_members')
        .insert({ tournament_id: tournamentId, user_id: user.id, paid: false })
      // Ignorar error de duplicado (ya inscripto)
      if (error && !error.code?.includes('23505')) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-tournaments'] })
    },
  })
}

export function useRenameTournament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from('tournaments').update({ name }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournaments'] })
      qc.invalidateQueries({ queryKey: ['user-tournaments'] })
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
