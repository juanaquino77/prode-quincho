import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Trophy, Users, CreditCard, CheckCircle2 } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { MatchCard } from '../components/matches/MatchCard'
import { Button } from '../components/ui/Button'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { useGlobalTournament, useUserTournaments, useCreatePayment } from '../hooks/useTournaments'
import { useAuthStore } from '../store/authStore'
import { useTournamentStore } from '../store/tournamentStore'
import { getStageName, cn, resolveMatches } from '../lib/utils'
import type { Match, MatchStage, Tournament } from '../types'

const STAGE_ORDER: MatchStage[] = ['group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function Predictions() {
  const { user } = useAuthStore()
  const { data: globalTournament } = useGlobalTournament()
  const { data: myTournaments } = useUserTournaments(user?.id)
  const { selectedTournamentId, setSelectedTournamentId } = useTournamentStore()
  const [searchParams] = useSearchParams()

  const [activeStage, setActiveStage] = useState<MatchStage>('group')
  const [activeGroup, setActiveGroup] = useState<string>('A')
  const hasSyncedStage = useRef(false)

  const allTournaments = useMemo<Tournament[]>(() => {
    const list: Tournament[] = []
    if (globalTournament) list.push(globalTournament)
    const friends = (myTournaments ?? []).filter((t) => t.type === 'friends')
    return [...list, ...friends]
  }, [globalTournament, myTournaments])

  const highlightMatchId = searchParams.get('matchId') ?? undefined

  // URL param ?t= takes priority on first load; then use global store
  useEffect(() => {
    const urlT = searchParams.get('t')
    if (urlT) setSelectedTournamentId(urlT)
  }, [searchParams, setSelectedTournamentId])

  const selectedTournament =
    allTournaments.find((t) => t.id === selectedTournamentId) ?? allTournaments[0] ?? null

  const competitionFilter = selectedTournament?.competition ?? undefined
  const { data: matches, isLoading } = useMatches(competitionFilter)
  const { data: predictions } = usePredictions(user?.id, selectedTournament?.id ?? '')
  const createPayment = useCreatePayment()

  const needsPayment = (selectedTournament?.entry_fee ?? 0) > 0 && selectedTournament?.user_paid === false

  async function handlePresentarTarjeta() {
    if (!selectedTournament) return
    const result = await createPayment.mutateAsync(selectedTournament.id)
    window.open(result.init_point, '_blank')
  }

  // Si viene un matchId por URL, navega a esa etapa
  useEffect(() => {
    if (!highlightMatchId || !matches) return
    const match = matches.find((m) => m.id === highlightMatchId)
    if (!match) return
    setActiveStage(match.stage)
    if (match.stage === 'group' && match.group_name) setActiveGroup(match.group_name)
  }, [highlightMatchId, matches])

  // Al cargar los partidos por primera vez, posicionarse en la etapa activa (live/upcoming)
  useEffect(() => {
    if (!matches || highlightMatchId || hasSyncedStage.current) return
    hasSyncedStage.current = true
    const stageSet = new Set(matches.map((m) => m.stage))
    const ordered = STAGE_ORDER.filter((s) => stageSet.has(s))
    const currentStage = ordered.find((stage) =>
      matches.some((m) => m.stage === stage && (m.status === 'live' || m.status === 'upcoming'))
    )
    if (currentStage) setActiveStage(currentStage)
  }, [matches, highlightMatchId])

  const availableStages = useMemo(() => {
    const stageSet = new Set((matches ?? []).map((m) => m.stage))
    return STAGE_ORDER.filter((s) => stageSet.has(s))
  }, [matches])

  // For apertura_2026: a stage is phase-locked when the previous stage still has
  // unfinished matches (classifiers not yet known). Predictions are hidden until unlocked.
  const phaseLockedStages = useMemo<Set<MatchStage>>(() => {
    const locked = new Set<MatchStage>()
    if (selectedTournament?.competition !== 'apertura_2026') return locked
    const allMatches = matches ?? []
    for (let i = 1; i < availableStages.length; i++) {
      const prevStage = availableStages[i - 1]
      const prevUnfinished = allMatches.some(
        (m) => m.stage === prevStage && m.status !== 'finished'
      )
      if (prevUnfinished) locked.add(availableStages[i])
    }
    return locked
  }, [matches, availableStages, selectedTournament?.competition])

  // Unlock time per match (keyed by match.id).
  // Each locked match depends on exactly the 2 previous-stage matches whose winners play in it.
  // Team names like "Gan. Rivadavia o Unión" tell us which feeder match to look for.
  const phaseUnlockTimes = useMemo<Map<string, Date>>(() => {
    const map = new Map<string, Date>()
    if (selectedTournament?.competition !== 'apertura_2026') return map
    const allMatches = matches ?? []

    phaseLockedStages.forEach((stage) => {
      const stageIdx = availableStages.indexOf(stage)
      if (stageIdx <= 0) return
      const prevStage = availableStages[stageIdx - 1]
      const prevMatches = allMatches.filter((m) => m.stage === prevStage)

      allMatches.filter((m) => m.stage === stage).forEach((match) => {
        const feederDates: number[] = []

        for (const teamName of [match.home_team, match.away_team]) {
          // "Gan. X o Y" → find prev match where one team contains X and the other Y
          const ganMatch = teamName.match(/^Gan\.\s+(.+?)\s+o\s+(.+)$/)
          if (!ganMatch) continue
          const [, partA, partB] = ganMatch
          const feeder = prevMatches.find(
            (pm) =>
              (pm.home_team.includes(partA) || pm.away_team.includes(partA)) &&
              (pm.home_team.includes(partB) || pm.away_team.includes(partB))
          )
          if (feeder) feederDates.push(new Date(feeder.match_date).getTime())
        }

        if (feederDates.length > 0) {
          const latestFeeder = Math.max(...feederDates)
          map.set(match.id, new Date(latestFeeder + 2.5 * 60 * 60 * 1000))
        }
      })
    })
    return map
  }, [matches, availableStages, phaseLockedStages, selectedTournament?.competition])

  // Mapa de matchId → momento de cierre: horario propio de cada partido
  const roundLockTimes = useMemo<Map<string, Date>>(() => {
    const map = new Map<string, Date>()
    for (const m of matches ?? []) {
      map.set(m.id, new Date(m.match_date))
    }
    return map
  }, [matches])

  const resolvedStage = availableStages.includes(activeStage)
    ? activeStage
    : availableStages[0] ?? 'group'

  const predMap = new Map(predictions?.map((p) => [p.match_id, p]))

  const filteredMatches = resolveMatches(matches ?? []).filter((m: Match) => {
    if (resolvedStage === 'group') return m.stage === 'group' && m.group_name === activeGroup
    return m.stage === resolvedStage
  })

  const showStageTabs = availableStages.length > 1
  const showGroupTabs = resolvedStage === 'group'

  function switchTournament(t: Tournament) {
    setSelectedTournamentId(t.id)
    setActiveStage('group')
    setActiveGroup('A')
    hasSyncedStage.current = false
  }

  if (!selectedTournament && allTournaments.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20 text-white/40">Cargando torneos...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Mis Pronósticos</h1>
        <p className="text-white/50 text-sm mt-0.5">Ingresá tu resultado esperado antes de cada partido</p>
      </div>

      {/* ── Tournament selector ── prominent when multiple exist ── */}
      {allTournaments.length > 1 ? (
        <div className="mb-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            ¿Para qué torneo querés pronosticar?
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {allTournaments.map((t) => {
              const isSelected = selectedTournament?.id === t.id
              const competitionLabel = t.competition === 'apertura_2026'
                ? '🇦🇷 Apertura 2026'
                : t.competition === 'mundial_2026'
                ? '🌎 Mundial 2026'
                : '🌐 Global'
              return (
                <button
                  key={t.id}
                  onClick={() => switchTournament(t)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                    isSelected
                      ? 'bg-union-blue/20 border-union-blue text-white shadow-[0_0_12px_rgba(0,168,222,0.15)]'
                      : 'bg-union-navy-light border-union-blue/20 text-white/60 hover:text-white hover:border-union-blue/50'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    isSelected ? 'bg-union-blue/30' : 'bg-white/5'
                  )}>
                    {t.type === 'global'
                      ? <Trophy size={15} className={isSelected ? 'text-union-blue' : 'text-white/40'} />
                      : <Users size={15} className={isSelected ? 'text-union-blue' : 'text-white/40'} />}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      'text-sm font-semibold truncate leading-tight',
                      isSelected ? 'text-white' : 'text-white/70'
                    )}>
                      {t.name}
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5">{competitionLabel}</p>
                  </div>
                  {isSelected && (
                    <div className="ml-auto shrink-0 w-2 h-2 rounded-full bg-union-blue" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Single tournament: just show name as subtitle */
        selectedTournament && (
          <div className="mb-4 flex items-center gap-2">
            <Trophy size={14} className="text-union-blue" />
            <span className="text-sm font-semibold text-union-blue">{selectedTournament.name}</span>
          </div>
        )
      )}

      {/* Stage tabs */}
      {showStageTabs && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {availableStages.map((stage) => (
            <button
              key={stage}
              onClick={() => { setActiveStage(stage); if (stage === 'group') setActiveGroup('A') }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                resolvedStage === stage ? 'bg-union-blue text-white' : 'bg-union-navy-light text-white/50 hover:text-white'
              )}
            >
              {getStageName(stage)}
            </button>
          ))}
        </div>
      )}

      {/* Group tabs */}
      {showGroupTabs && (
        <div className="flex gap-1 mb-4 flex-wrap">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={cn(
                'w-9 h-9 rounded-lg text-xs font-bold transition-colors',
                activeGroup === g ? 'bg-union-blue text-white' : 'bg-union-navy-light text-white/40 hover:text-white'
              )}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-white/40">Cargando partidos...</div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-12 text-white/40">No hay partidos en esta etapa</div>
      ) : (
        <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', selectedTournament?.entry_fee && selectedTournament.entry_fee > 0 ? 'pb-24' : '')}>
          {filteredMatches.map((match: Match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predMap.get(match.id)}
              tournamentId={selectedTournament!.id}
              userId={user!.id}
              phaseLocked={match.home_team.startsWith('Gan.') || match.away_team.startsWith('Gan.')}
              phaseUnlockAt={phaseUnlockTimes.get(match.id)}
              lockAt={roundLockTimes.get(match.id)}
              highlighted={match.id === highlightMatchId}
              requiresExactScore={selectedTournament!.rules?.requires_exact_score ?? true}
              rules={selectedTournament!.rules}
            />
          ))}
        </div>
      )}

      {/* Presentar tarjeta — sticky bottom bar para torneos con entrada */}
      {selectedTournament && (selectedTournament.entry_fee ?? 0) > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-union-navy/95 backdrop-blur-sm border-t border-union-blue/20 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            {needsPayment ? (
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3"
                onClick={handlePresentarTarjeta}
                loading={createPayment.isPending}
              >
                <CreditCard size={16} className="mr-2" />
                Presentar tarjeta — ${selectedTournament.entry_fee} ARS
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2 text-green-400 font-semibold">
                <CheckCircle2 size={18} />
                Tarjeta presentada
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
