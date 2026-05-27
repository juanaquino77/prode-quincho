import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Trophy, Users, CreditCard, CheckCircle2, AlertTriangle, Save } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { MatchCard } from '../components/matches/MatchCard'
import { Button } from '../components/ui/Button'
import { useMatches } from '../hooks/useMatches'
import { usePredictions, useUpsertPrediction } from '../hooks/usePredictions'
import { useGlobalTournament, useUserTournaments, useCreatePayment } from '../hooks/useTournaments'
import { useAuthStore } from '../store/authStore'
import { useTournamentStore } from '../store/tournamentStore'
import { getStageName, cn, resolveMatches } from '../lib/utils'
import type { Match, MatchStage, Tournament, PenaltyWinner } from '../types'

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
    // Preferir versión de myTournaments para el global (tiene user_paid)
    const globalWithMembership = (myTournaments ?? []).find((t) => t.type === 'global')
    const globalEntry = globalWithMembership ?? globalTournament
    const list: Tournament[] = globalEntry ? [globalEntry] : []
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
  const upsert = useUpsertPrediction()

  const needsPayment = (selectedTournament?.entry_fee ?? 0) > 0 && selectedTournament?.user_paid !== true

  async function handlePresentarTarjeta() {
    if (!selectedTournament) return
    const result = await createPayment.mutateAsync(selectedTournament.id)
    const isSandbox = import.meta.env.VITE_MP_SANDBOX === 'true'
    window.open(isSandbox ? result.sandbox_init_point : result.init_point, '_blank')
  }

  // ── Batch mode (fase de grupos) ──────────────────────────────
  type BatchVal = { home: string; away: string; penalty: PenaltyWinner | null }
  const [batchValues, setBatchValues] = useState<Record<string, BatchVal>>({})
  const [batchSaved, setBatchSaved] = useState(false)
  const [emptyWarning, setEmptyWarning] = useState<Match[]>([])
  const [abultadoWarning, setAbultadoWarning] = useState<Match[]>([])
  const pendingGroupRef = useRef<Match[]>([])

  // Inicializar batchValues con predicciones ya guardadas (sin pisar cambios del user)
  useEffect(() => {
    if (!predictions) return
    setBatchValues((prev) => {
      const next = { ...prev }
      for (const p of predictions) {
        if (!next[p.match_id]) {
          next[p.match_id] = {
            home: p.home_score_pred?.toString() ?? '',
            away: p.away_score_pred?.toString() ?? '',
            penalty: p.penalty_pred ?? null,
          }
        }
      }
      return next
    })
  }, [predictions])

  // Resetear feedback al cambiar de grupo/torneo
  useEffect(() => { setBatchSaved(false) }, [activeGroup, selectedTournamentId])

  const handleBatchChange = useCallback((matchId: string, home: string, away: string, penalty: PenaltyWinner | null) => {
    setBatchValues((prev) => ({ ...prev, [matchId]: { home, away, penalty } }))
  }, [])

  async function doSaveGroup(groupMatches: Match[]) {
    if (!user || !selectedTournament) return
    const unlocked = groupMatches.filter((m) => !isMatchLockedById(m))
    await Promise.all(unlocked.map((m) => {
      const v = batchValues[m.id]
      if (!v || v.home === '' || v.away === '') return Promise.resolve()
      const hVal = parseInt(v.home)
      const aVal = parseInt(v.away)
      if (isNaN(hVal) || isNaN(aVal)) return Promise.resolve()
      return upsert.mutateAsync({
        user_id: user.id,
        match_id: m.id,
        tournament_id: selectedTournament.id,
        home_score_pred: hVal,
        away_score_pred: aVal,
        penalty_pred: v.penalty,
      })
    }))
    setBatchSaved(true)
    setTimeout(() => setBatchSaved(false), 2500)
  }

  async function handleSaveGroup(groupMatches: Match[]) {
    if (!user || !selectedTournament) return
    const unlocked = groupMatches.filter((m) => !isMatchLockedById(m))
    const empty = unlocked.filter((m) => {
      const v = batchValues[m.id]
      return !v || (v.home === '' && v.away === '')
    })
    if (empty.length > 0) { setEmptyWarning(empty); return }

    const abultados = unlocked.filter((m) => {
      const v = batchValues[m.id]
      if (!v || v.home === '' || v.away === '') return false
      const h = parseInt(v.home), a = parseInt(v.away)
      return !isNaN(h) && !isNaN(a) && Math.abs(h - a) > 5
    })
    if (abultados.length > 0) {
      pendingGroupRef.current = unlocked
      setAbultadoWarning(abultados)
      return
    }

    await doSaveGroup(unlocked)
  }

  function isMatchLockedById(match: Match): boolean {
    const lockAt = roundLockTimes.get(match.id)
    if (!lockAt) return false
    return Date.now() >= lockAt.getTime()
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
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1 flex-wrap flex-1">
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
          <button
            onClick={() => handleSaveGroup(filteredMatches)}
            disabled={upsert.isPending}
            title={`Guardar Grupo ${activeGroup}`}
            className="shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-bold bg-union-blue text-white hover:bg-union-blue/80 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {batchSaved
              ? <CheckCircle2 size={14} />
              : <Save size={14} />}
            {batchSaved ? '¡Listo!' : 'Guardar'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-white/40">Cargando partidos...</div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-12 text-white/40">No hay partidos en esta etapa</div>
      ) : resolvedStage === 'group' ? (
        /* ── Fase de grupos: modo batch con botón único por grupo ── */
        <>
          <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', needsPayment ? 'pb-24' : '')}>
            {filteredMatches.map((match: Match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predMap.get(match.id)}
                tournamentId={selectedTournament!.id}
                userId={user!.id}
                lockAt={roundLockTimes.get(match.id)}
                highlighted={match.id === highlightMatchId}
                requiresExactScore={selectedTournament!.rules?.requires_exact_score ?? true}
                rules={selectedTournament!.rules}
                batchMode
                onBatchChange={handleBatchChange}
              />
            ))}
          </div>
          <div className={cn('mt-4', needsPayment ? 'mb-28' : 'mb-4')}>
            <Button
              className="w-full py-3 text-sm font-bold"
              onClick={() => handleSaveGroup(filteredMatches)}
              loading={upsert.isPending}
            >
              {batchSaved
                ? <><CheckCircle2 size={16} className="mr-2" />¡Pronósticos del Grupo {activeGroup} guardados!</>
                : `Guardar pronósticos del Grupo ${activeGroup}`}
            </Button>
          </div>
        </>
      ) : (
        /* ── Etapas eliminatorias: modo individual (sin cambios) ── */
        <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', needsPayment ? 'pb-24' : '')}>
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

      {/* Modal advertencia: partidos sin resultado */}
      {emptyWarning.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-union-navy border border-yellow-500/30 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={22} className="text-yellow-400 shrink-0" />
              <p className="text-white font-bold text-base">Partidos sin resultado</p>
            </div>
            <p className="text-white/60 text-sm mb-3">
              Los siguientes partidos no tienen pronóstico:
            </p>
            <ul className="mb-5 space-y-1">
              {emptyWarning.map((m) => (
                <li key={m.id} className="text-yellow-400 text-sm font-semibold">
                  {m.home_team} vs {m.away_team}
                </li>
              ))}
            </ul>
            <Button className="w-full" onClick={() => setEmptyWarning([])}>
              Volver a completarlos
            </Button>
          </div>
        </div>
      )}

      {/* Modal advertencia: diferencia de goles abultada */}
      {abultadoWarning.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-union-navy border border-orange-500/30 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={22} className="text-orange-400 shrink-0" />
              <p className="text-white font-bold text-base">Resultado muy abultado</p>
            </div>
            <p className="text-white/60 text-sm mb-3">
              {abultadoWarning.length === 1
                ? 'El siguiente partido tiene una diferencia de más de 5 goles:'
                : 'Los siguientes partidos tienen una diferencia de más de 5 goles:'}
            </p>
            <ul className="mb-5 space-y-1">
              {abultadoWarning.map((m) => {
                const v = batchValues[m.id]
                return (
                  <li key={m.id} className="text-orange-400 text-sm font-semibold">
                    {m.home_team} vs {m.away_team}
                    {v && ` (${v.home}-${v.away})`}
                  </li>
                )
              })}
            </ul>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setAbultadoWarning([])}>
                Corregir
              </Button>
              <Button
                className="flex-1"
                loading={upsert.isPending}
                onClick={async () => {
                  setAbultadoWarning([])
                  await doSaveGroup(pendingGroupRef.current)
                }}
              >
                Guardar igual
              </Button>
            </div>
          </div>
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
