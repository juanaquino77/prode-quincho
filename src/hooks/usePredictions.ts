import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useMatches } from './useMatches'
import type { Prediction, MatchStage } from '../types'

const STAGE_ORDER: MatchStage[] = ['group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']

export function usePredictionCompletion(
  userId: string | undefined,
  tournamentId: string,
  competition: string | null,
) {
  const { data: matches } = useMatches(competition ?? undefined)
  const { data: predictions } = usePredictions(userId, tournamentId)

  return useMemo(() => {
    const allMatches = matches ?? []
    let countableMatches = allMatches

    if (competition === 'apertura_2026') {
      const stageSet = new Set(allMatches.map((m) => m.stage))
      const orderedStages = STAGE_ORDER.filter((s: MatchStage) => stageSet.has(s))
      const firstLockedIdx = orderedStages.findIndex((_stage: MatchStage, i: number) => {
        if (i === 0) return false
        const prevStage = orderedStages[i - 1]
        return allMatches.some((m) => m.stage === prevStage && m.status !== 'finished')
      })
      const openStages = new Set(
        firstLockedIdx === -1 ? orderedStages : orderedStages.slice(0, firstLockedIdx)
      )
      countableMatches = allMatches.filter((m) => openStages.has(m.stage))
    }

    const matchIds = new Set(countableMatches.map((m) => m.id))
    const total = countableMatches.length
    const filled = (predictions ?? []).filter((p) => matchIds.has(p.match_id)).length
    const isComplete = total > 0 && filled >= total
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0
    return { total, filled, isComplete, pct }
  }, [matches, predictions, competition])
}

export interface TournamentWithPredictionCount {
  id: string
  name: string
  type: string
  prediction_count: number
}

export function usePredictions(userId: string | undefined, tournamentId: string) {
  return useQuery({
    queryKey: ['predictions', userId, tournamentId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('*, match:matches(*)')
        .eq('user_id', userId!)
        .eq('tournament_id', tournamentId)
      if (error) throw error
      return data as Prediction[]
    },
  })
}

export function useUserTournamentsWithPredictions(
  userId: string | undefined,
  excludeId: string | undefined
) {
  return useQuery({
    queryKey: ['user-tournaments-predictions', userId, excludeId],
    enabled: !!userId && !!excludeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('tournament_id')
        .eq('user_id', userId!)
        .neq('tournament_id', excludeId!)
      if (error) throw error
      if (!data?.length) return []

      const counts: Record<string, number> = {}
      for (const p of data) {
        counts[p.tournament_id] = (counts[p.tournament_id] || 0) + 1
      }

      const ids = Object.keys(counts)
      const { data: tournaments, error: tErr } = await supabase
        .from('tournaments')
        .select('id, name, type')
        .in('id', ids)
      if (tErr) throw tErr

      return (tournaments || [])
        .map((t) => ({ ...t, prediction_count: counts[t.id] || 0 }))
        .sort((a, b) => b.prediction_count - a.prediction_count) as TournamentWithPredictionCount[]
    },
  })
}

export function useCopyPredictions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      userId,
      sourceTournamentId,
      targetTournamentId,
    }: {
      userId: string
      sourceTournamentId: string
      targetTournamentId: string
    }) => {
      const { data, error } = await supabase.rpc('copy_predictions', {
        p_user_id: userId,
        p_source_tournament_id: sourceTournamentId,
        p_target_tournament_id: targetTournamentId,
      })
      if (error) throw error
      return data as number
    },
    onSuccess: (_count, vars) => {
      qc.invalidateQueries({ queryKey: ['predictions', vars.userId, vars.targetTournamentId] })
    },
  })
}

export function useUpsertPrediction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pred: {
      user_id: string
      match_id: string
      tournament_id: string
      home_score_pred: number
      away_score_pred: number
      penalty_pred?: 'home' | 'away' | null
    }) => {
      const { data, error } = await supabase
        .from('predictions')
        .upsert(pred, { onConflict: 'user_id,match_id,tournament_id' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['predictions', vars.user_id, vars.tournament_id] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}
