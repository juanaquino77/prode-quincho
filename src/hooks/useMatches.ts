import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getMatchPlaceholder, findNextMatch } from '../lib/utils'
import type { Match } from '../types'

/** Suscripción Realtime: invalida el caché de matches cuando cambia la DB.
 *  Llamar una sola vez desde App.tsx o Layout. */
export function useMatchesRealtime() {
  const qc = useQueryClient()
  useEffect(() => {
    const channel = supabase
      .channel('matches-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, () => {
        qc.invalidateQueries({ queryKey: ['matches'] })
        qc.invalidateQueries({ queryKey: ['leaderboard'] })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'predictions' }, () => {
        qc.invalidateQueries({ queryKey: ['leaderboard'] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc])
}

export function useMatches(competition?: string) {
  return useQuery({
    queryKey: ['matches', competition],
    queryFn: async () => {
      let query = supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true })
      if (competition) query = query.eq('competition', competition)
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
    onSuccess: async (updated) => {
      qc.setQueriesData<Match[]>({ queryKey: ['matches'] }, (old) =>
        old?.map((m) => (m.id === updated.id ? updated : m))
      )
      qc.invalidateQueries({ queryKey: ['leaderboard'] })

      // Propagar ganador a la siguiente ronda cuando el partido finaliza
      if (updated.status === 'finished' && updated.home_score !== null && updated.away_score !== null) {
        const allMatches: Match[] =
          qc.getQueryData<Match[]>(['matches', updated.competition]) ??
          qc.getQueryData<Match[]>(['matches']) ??
          []
        const placeholder = getMatchPlaceholder(updated)
        if (placeholder) {
          const next = findNextMatch(placeholder, allMatches)
          if (next) {
            const homeWins =
              updated.penalty_winner === 'home' ||
              updated.home_score > updated.away_score
            const winner = homeWins ? updated.home_team : updated.away_team
            await supabase
              .from('matches')
              .update({ [next.field]: winner })
              .eq('id', next.match.id)
            qc.invalidateQueries({ queryKey: ['matches'] })
          }
        }
      }
    },
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
