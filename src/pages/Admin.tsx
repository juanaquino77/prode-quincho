import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { useForm, type Resolver, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit2, Trash2, Save, X, Users, Calendar, ShieldAlert, ClipboardList, Layers, Eye, EyeOff, Ticket, Trophy, DollarSign, ChevronUp, ChevronDown } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { useMatches, useUpsertMatch, useDeleteMatch } from '../hooks/useMatches'
import { useAdminTournamentTypes, useUpsertTournamentType, useToggleTournamentTypeActive } from '../hooks/useTournamentTypes'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { formatShortDate, getStageName, resolveMatches } from '../lib/utils'
import { cn } from '../lib/utils'
import type { Match, MatchStage, TournamentTypeAdmin } from '../types'
import { useIsAdmin, useIsOrganizer } from '../hooks/useAuth'
import { UserPredictionsModal } from '../components/leaderboard/UserPredictionsModal'

// Contexto de permisos para el panel de admin
const AdminCtx = createContext({ readOnly: false, isOrganizer: false })
const useReadOnly = () => useContext(AdminCtx).readOnly
const useIsOrganizerCtx = () => useContext(AdminCtx).isOrganizer

// ─── Types ────────────────────────────────────────────────────
interface AdminUser {
  user_id: string
  email: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  user_is_admin: boolean
  free_pass: boolean
  freepass_reason: string | null
  paid_global: boolean
  is_organizer: boolean
  created_at: string
  phone: string | null
}

interface FreepassReasonOption {
  id: string
  label: string
  created_at: string
}

// ─── Hooks ────────────────────────────────────────────────────
function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_users')
      if (error) throw error
      const users = Array.isArray(data) ? data : (data ?? [])
      return users as AdminUser[]
    },
    retry: false,
  })
}

function useAdminDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

function useAdminSetOrganizer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, isOrganizer }: { userId: string; isOrganizer: boolean }) => {
      const { error } = await supabase.rpc('admin_set_organizer', { p_user_id: userId, p_is_organizer: isOrganizer })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

function useToggleFreePass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, freePass, reason }: { userId: string; freePass: boolean; reason?: string | null }) => {
      const { error } = await supabase.rpc('admin_set_free_pass', {
        p_user_id: userId,
        p_free_pass: freePass,
        p_reason: reason ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

function useFreepassReasons() {
  return useQuery({
    queryKey: ['admin-freepass-reasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('freepass_reason_options')
        .select('id, label, created_at')
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as FreepassReasonOption[]
    },
  })
}

function useAddFreepassReason() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (label: string) => {
      const { error } = await supabase
        .from('freepass_reason_options')
        .insert({ label })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-freepass-reasons'] }),
  })
}

function useDeleteFreepassReason() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('freepass_reason_options')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-freepass-reasons'] }),
  })
}

// ─── Match form schema ────────────────────────────────────────
const matchSchema = z.object({
  match_number: z.coerce.number().min(1),
  stage: z.string().min(1),
  group_name: z.string().nullable().optional(),
  home_team: z.string().min(1),
  away_team: z.string().min(1),
  home_flag: z.string().optional(),
  away_flag: z.string().optional(),
  match_date: z.string().min(1),
  venue: z.string().optional(),
  home_score: z.coerce.number().nullable().optional(),
  away_score: z.coerce.number().nullable().optional(),
  penalty_winner: z.enum(['home', 'away', '']).optional().nullable(),
  status: z.enum(['upcoming', 'live', 'finished']),
  competition: z.string().min(1),
})
type MatchFormData = z.infer<typeof matchSchema>

// ─── Admin page ───────────────────────────────────────────────
type Tab = 'results' | 'matches' | 'users' | 'types' | 'torneos'

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('results')
  const isAdmin = useIsAdmin()
  const isOrganizer = useIsOrganizer()
  const isReadOnly = !isAdmin && isOrganizer

  return (
    <AdminCtx.Provider value={{ readOnly: isReadOnly, isOrganizer: !isAdmin && isOrganizer }}>
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
        <p className="text-white/50 text-sm mt-0.5">Gestión de partidos, usuarios y tipos de torneo</p>
      </div>

      {isReadOnly && (
        <div className="mb-5 flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
          <Eye size={16} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Vista de organizador</p>
            <p className="text-xs text-amber-400/60 mt-0.5">Podés cargar y modificar resultados de partidos. La gestión de usuarios, tipos y torneos es solo lectura.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-union-blue/15 pb-0 overflow-x-auto">
        {([
          { id: 'results',  label: 'Resultados', icon: ClipboardList },
          { id: 'matches',  label: 'Partidos',   icon: Calendar },
          { id: 'users',    label: 'Usuarios',   icon: Users },
          { id: 'types',    label: 'Tipos',      icon: Layers },
          { id: 'torneos',  label: 'Torneos',    icon: Trophy },
        ] as { id: Tab; label: string; icon: typeof Calendar }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors shrink-0',
              activeTab === id
                ? 'border-union-blue text-union-blue'
                : 'border-transparent text-white/50 hover:text-white'
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'results' && <ResultsTab />}
      {activeTab === 'matches' && <MatchesTab />}
      {activeTab === 'users'   && <UsersTab />}
      {activeTab === 'types'   && <TournamentTypesTab />}
      {activeTab === 'torneos' && <TorneosTab />}
    </Layout>
    </AdminCtx.Provider>
  )
}

// ─── Results tab ──────────────────────────────────────────────
function ResultsTab() {
  const { data: matches, isLoading } = useMatches()
  const upsert = useUpsertMatch()
  const [scores, setScores] = useState<Record<string, { home: string; away: string; pen: string; status: string }>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [filterStage, setFilterStage] = useState<string>('group')
  const [filterGroup, setFilterGroup] = useState<string>('A')
  const [viewMode, setViewMode] = useState<'stage' | 'calendar'>('stage')
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const hasInitializedDays = useRef(false)
  const liveRef = useRef<HTMLDivElement>(null)

  const STAGES = ['group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
  const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

  const allSorted = (matches ?? [])
    .slice()
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

  const liveMatches = allSorted.filter((m) => m.status === 'live')

  // Auto-scroll to live section when there are live matches
  useEffect(() => {
    if (liveMatches.length === 0 || !liveRef.current) return
    const timer = setTimeout(() => liveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    return () => clearTimeout(timer)
  }, [liveMatches.length])

  const relevant = viewMode === 'stage'
    ? allSorted.filter((m) =>
        filterStage === 'group'
          ? m.stage === 'group' && m.group_name === filterGroup
          : m.stage === filterStage
      )
    : allSorted

  // Agrupar por día para vista calendario
  const matchesByDay = viewMode === 'calendar' ? (() => {
    const days: { dateKey: string; label: string; matches: Match[] }[] = []
    for (const m of relevant) {
      const d = new Date(m.match_date)
      const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      const last = days[days.length - 1]
      if (last?.dateKey === dateKey) {
        last.matches.push(m)
      } else {
        days.push({
          dateKey,
          label: d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
          matches: [m],
        })
      }
    }
    return days
  })() : []

  useEffect(() => {
    if (viewMode !== 'calendar' || matchesByDay.length === 0) return
    if (hasInitializedDays.current) return
    hasInitializedDays.current = true
    const liveDay = matchesByDay.find((d) => d.matches.some((m) => m.status === 'live'))
    const upcomingDay = matchesByDay.find((d) => d.matches.some((m) => m.status === 'upcoming'))
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    setExpandedDays(new Set([liveDay?.dateKey ?? upcomingDay?.dateKey ?? todayKey]))
  }, [matchesByDay, viewMode])

  // Etapas que tienen al menos 1 partido cargado
  const existingStages = new Set(allSorted.map((m) => m.stage))
  const availableStages = STAGES.filter((s) => existingStages.has(s as MatchStage))

  // Grupos que tienen partidos
  const existingGroups = new Set(
    allSorted.filter((m) => m.stage === 'group').map((m) => m.group_name ?? '')
  )
  const availableGroups = GROUPS.filter((g) => existingGroups.has(g))

  // Nombres resueltos solo para display
  const resolvedById = new Map(resolveMatches(matches ?? []).map((r) => [r.id, r]))

  function getRow(m: Match) {
    return scores[m.id] ?? {
      home: m.home_score?.toString() ?? '',
      away: m.away_score?.toString() ?? '',
      pen: m.penalty_winner ?? '',
      status: m.status,
    }
  }

  function setField(m: Match, field: string, val: string) {
    setScores((prev) => ({ ...prev, [m.id]: { ...getRow(m), [field]: val } }))
  }

  async function handleSave(m: Match) {
    const row = getRow(m)
    const home = parseInt(row.home)
    const away = parseInt(row.away)
    setSavingId(m.id)
    await upsert.mutateAsync({
      ...m,
      home_score: isNaN(home) ? null : home,
      away_score: isNaN(away) ? null : away,
      penalty_winner: (row.pen || null) as 'home' | 'away' | null,
      status: row.status as Match['status'],
    })
    setSavingId(null)
    setSaved((prev) => ({ ...prev, [m.id]: true }))
    setTimeout(() => setSaved((prev) => ({ ...prev, [m.id]: false })), 2000)
  }

  if (isLoading) return <p className="text-white/40">Cargando...</p>

  return (
    <div className="space-y-3">
      {/* ── En vivo ahora ── */}
      {liveMatches.length > 0 && (
        <div ref={liveRef} className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <h3 className="text-sm font-bold text-red-400">En vivo ahora</h3>
          </div>
          <div className="space-y-2">
            {liveMatches.map((m) => <MatchResultCard key={m.id} m={m} resolvedById={resolvedById} getRow={getRow} setField={setField} handleSave={handleSave} savingId={savingId} saved={saved} />)}
          </div>
          <div className="h-px bg-union-blue/15 my-4" />
        </div>
      )}

      {/* Toggle */}
      <div className="flex gap-1.5 p-1 bg-union-navy-light rounded-xl border border-union-blue/15 w-fit">
        {(['stage', 'calendar'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              viewMode === mode ? 'bg-union-blue text-white shadow-sm' : 'text-white/40 hover:text-white/70'
            )}
          >
            {mode === 'stage' ? 'Por etapa' : 'Por fecha'}
          </button>
        ))}
      </div>

      {/* Stage + group tabs (solo en modo etapa) */}
      {viewMode === 'stage' && (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {availableStages.map((s) => (
              <button
                key={s}
                onClick={() => { setFilterStage(s); if (s === 'group') setFilterGroup('A') }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                  filterStage === s ? 'bg-union-blue text-white' : 'bg-union-navy-light text-white/50 hover:text-white'
                )}
              >
                {getStageName(s as MatchStage)}
              </button>
            ))}
          </div>
          {filterStage === 'group' && availableGroups.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {availableGroups.map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGroup(g)}
                  className={cn(
                    'w-9 h-9 rounded-lg text-xs font-bold transition-colors',
                    filterGroup === g ? 'bg-union-blue text-white' : 'bg-union-navy-light text-white/40 hover:text-white'
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Vista calendario */}
      {viewMode === 'calendar' ? (
        matchesByDay.length === 0
          ? <Card className="text-center py-8 text-white/40 text-sm">No hay partidos cargados</Card>
          : matchesByDay.map((day) => {
            const isOpen = expandedDays.has(day.dateKey)
            const hasLive = day.matches.some((m) => m.status === 'live')
            const hasUpcoming = day.matches.some((m) => m.status === 'upcoming')
            const finishedCount = day.matches.filter((m) => m.status === 'finished').length
            return (
              <div key={day.dateKey} className="mb-3">
                <button
                  onClick={() => setExpandedDays((prev) => {
                    const next = new Set(prev)
                    if (next.has(day.dateKey)) next.delete(day.dateKey)
                    else next.add(day.dateKey)
                    return next
                  })}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-union-navy-light border border-union-blue/15 hover:border-union-blue/35 transition-all text-left"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white capitalize">{day.label}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/40">{day.matches.length} partido{day.matches.length !== 1 ? 's' : ''}</span>
                      {hasLive && <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">EN VIVO</span>}
                      {!hasLive && hasUpcoming && <span className="text-[10px] font-bold text-union-blue bg-union-blue/10 px-1.5 py-0.5 rounded-full">HOY</span>}
                      {finishedCount > 0 && (
                        <span className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                          finishedCount === day.matches.length ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'
                        )}>
                          {finishedCount === day.matches.length ? '✓ Todos finalizados' : `${finishedCount}/${day.matches.length} finalizados`}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown size={16} className={cn('text-white/40 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="mt-3 space-y-2">
                    {day.matches.map((m) => <MatchResultCard key={m.id} m={m} resolvedById={resolvedById} getRow={getRow} setField={setField} handleSave={handleSave} savingId={savingId} saved={saved} />)}
                  </div>
                )}
              </div>
            )
          })
      ) : (
        <>
              {relevant.map((m) => <MatchResultCard key={m.id} m={m} resolvedById={resolvedById} getRow={getRow} setField={setField} handleSave={handleSave} savingId={savingId} saved={saved} />)}
          {relevant.length === 0 && (
            <Card className="text-center py-8 text-white/40 text-sm">No hay partidos en esta etapa</Card>
          )}
        </>
      )}
    </div>
  )
}

function MatchResultCard({ m, resolvedById, getRow, setField, handleSave, savingId, saved }: {
  m: Match
  resolvedById: Map<string, Match>
  getRow: (m: Match) => { home: string; away: string; pen: string; status: string }
  setField: (m: Match, field: string, val: string) => void
  handleSave: (m: Match) => Promise<void>
  savingId: string | null
  saved: Record<string, boolean>
}) {
  const KNOCKOUT = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
  const row = getRow(m)
  const homeVal = parseInt(row.home)
  const awayVal = parseInt(row.away)
  const isDraw = !isNaN(homeVal) && !isNaN(awayVal) && homeVal === awayVal
  const showPen = KNOCKOUT.includes(m.stage) && isDraw

  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant={m.status === 'finished' ? 'gray' : m.status === 'live' ? 'green' : 'blue'}>
            {getStageName(m.stage)}{m.group_name ? ` ${m.group_name}` : ''}
          </Badge>
          <span className="text-xs text-white/40">{formatShortDate(m.match_date)}</span>
        </div>
        <select
          value={row.status}
          onChange={(e) => setField(m, 'status', e.target.value)}
          className="text-xs bg-union-navy-light border border-union-blue/20 rounded-lg text-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-union-blue"
        >
          <option value="upcoming">Próximo</option>
          <option value="live">En vivo</option>
          <option value="finished">Finalizado</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex-1 text-sm font-semibold text-white truncate text-right">{resolvedById.get(m.id)?.home_team ?? m.home_team}</span>
        <input
          type="number" min="0" max="20"
          value={row.home}
          onChange={(e) => setField(m, 'home', e.target.value)}
          className="w-12 h-9 text-center bg-union-navy border border-union-blue/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-union-blue"
          placeholder="—"
        />
        <span className="text-white/30 text-xs font-bold">-</span>
        <input
          type="number" min="0" max="20"
          value={row.away}
          onChange={(e) => setField(m, 'away', e.target.value)}
          className="w-12 h-9 text-center bg-union-navy border border-union-blue/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-union-blue"
          placeholder="—"
        />
        <span className="flex-1 text-sm font-semibold text-white truncate">{resolvedById.get(m.id)?.away_team ?? m.away_team}</span>
        <Button size="sm" onClick={() => handleSave(m)} loading={savingId === m.id} className="shrink-0">
          {saved[m.id] ? '✓' : <Save size={13} />}
        </Button>
      </div>

      {showPen && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-yellow-400 font-semibold">Pen:</span>
          <select
            value={row.pen}
            onChange={(e) => setField(m, 'pen', e.target.value)}
            className="flex-1 text-xs bg-union-navy-light border border-yellow-500/30 rounded-lg text-white px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          >
            <option value="">— Sin definir —</option>
            <option value="home">{resolvedById.get(m.id)?.home_team ?? m.home_team}</option>
            <option value="away">{resolvedById.get(m.id)?.away_team ?? m.away_team}</option>
          </select>
        </div>
      )}
    </Card>
  )
}

// ─── Matches tab ──────────────────────────────────────────────
function MatchesTab() {
  const { data: matches, isLoading } = useMatches()
  const upsert = useUpsertMatch()
  const deleteMatch = useDeleteMatch()
  const [editMatch, setEditMatch] = useState<Partial<Match> | null>(null)
  const [filterStage, setFilterStage] = useState('group')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = matches?.filter((m) => m.stage === filterStage) ?? []
  const resolvedById = new Map(resolveMatches(matches ?? []).map((r) => [r.id, r]))

  function openNew() {
    setEditMatch({ stage: filterStage as MatchStage, status: 'upcoming', group_name: null })
  }

  async function handleDelete(id: string) {
    await deleteMatch.mutateAsync(id)
    setConfirmDelete(null)
  }

  const STAGES = ['group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {STAGES.map((s) => (
            <button key={s} onClick={() => setFilterStage(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${filterStage === s ? 'bg-union-blue text-white' : 'bg-union-navy-light text-white/50 hover:text-white'}`}>
              {getStageName(s)}
            </button>
          ))}
        </div>
        <Button onClick={openNew} className="ml-3 shrink-0"><Plus size={16} className="mr-1" />Nuevo</Button>
      </div>

      {isLoading ? (
        <p className="text-white/40">Cargando...</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((match) => (
            <Card key={match.id} className="flex items-center gap-4">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {match.group_name && <Badge variant="blue">Gr.{match.group_name}</Badge>}
                <span className="text-sm font-medium text-white truncate">
                  {match.home_flag} {resolvedById.get(match.id)?.home_team ?? match.home_team} vs {resolvedById.get(match.id)?.away_team ?? match.away_team} {match.away_flag}
                </span>
                {match.status === 'finished' && (
                  <span className="text-white/60 text-sm font-bold shrink-0">{match.home_score}-{match.away_score}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-white/30 hidden sm:block">{formatShortDate(match.match_date)}</span>
                <Badge variant={match.status === 'finished' ? 'gray' : match.status === 'live' ? 'green' : 'blue'}>
                  {match.status === 'finished' ? 'Fin' : match.status === 'live' ? 'Live' : 'Próx'}
                </Badge>
                <button onClick={() => setEditMatch(match)} className="p-1.5 text-white/40 hover:text-union-blue transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setConfirmDelete(match.id)} className="p-1.5 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Card className="text-center py-8 text-white/40 text-sm">No hay partidos en esta etapa</Card>
          )}
        </div>
      )}

      {editMatch !== null && (
        <MatchFormModal
          match={editMatch}
          onClose={() => setEditMatch(null)}
          onSave={async (data) => {
            await upsert.mutateAsync({
              ...editMatch,
              ...data,
              stage: data.stage as MatchStage,
              penalty_winner: data.penalty_winner === '' ? null : (data.penalty_winner ?? null),
            })
            setEditMatch(null)
          }}
          loading={upsert.isPending}
        />
      )}

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar eliminación">
        <p className="text-white/70 mb-4">¿Estás seguro de que querés eliminar este partido? Esta acción no se puede deshacer.</p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => handleDelete(confirmDelete!)} loading={deleteMatch.isPending} className="flex-1">Eliminar</Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)} className="flex-1">Cancelar</Button>
        </div>
      </Modal>
    </>
  )
}

// ─── Users tab ────────────────────────────────────────────────
function UsersTab() {
  const { data: users, isLoading, error } = useAdminUsers()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  // Derivar siempre del dato fresco para que el modal refleje cambios inmediatamente
  const selectedUser = selectedUserId ? (users ?? []).find(u => u.user_id === selectedUserId) ?? null : null

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-white/40 text-sm">{users?.length ?? 0} usuarios registrados</p>
      </div>

      {isLoading ? (
        <p className="text-white/40">Cargando usuarios...</p>
      ) : error ? (
        <Card className="py-6 text-center">
          <p className="text-red-400 text-sm font-semibold mb-1">Error al cargar usuarios</p>
          <p className="text-white/40 text-xs font-mono">{(error as Error).message}</p>
          <p className="text-white/30 text-xs mt-2">¿Ejecutaste la migración 008 en Supabase?</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {(users ?? []).map((u) => (
            <Card
              key={u.user_id}
              className="flex items-center gap-3 cursor-pointer hover:border-union-blue/40 transition-colors"
              onClick={() => setSelectedUserId(u.user_id)}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-union-blue/20 border border-union-blue/30 flex items-center justify-center overflow-hidden shrink-0">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-9 h-9 object-cover rounded-full" />
                ) : (
                  <span className="text-sm font-bold text-union-blue">
                    {(u.username ?? u.email ?? '?')[0].toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white truncate">{u.username ?? '—'}</span>
                  {u.user_is_admin && (
                    <Badge variant="blue"><ShieldAlert size={10} className="mr-1" />Admin</Badge>
                  )}
                  {u.is_organizer && !u.user_is_admin && (
                    <Badge variant="blue"><Eye size={10} className="mr-1" />Organizador</Badge>
                  )}
                  {u.free_pass && (
                    <Badge variant="green"><Ticket size={10} className="mr-1" />Pase libre</Badge>
                  )}
                  {!u.free_pass && u.paid_global && (
                    <Badge variant="green">✓ Pagó</Badge>
                  )}
                  {!u.free_pass && !u.paid_global && (
                    <Badge variant="gray">Sin pago</Badge>
                  )}
                </div>
                <p className="text-xs text-white/40 truncate">{u.email}</p>
              </div>

              {/* Phone indicator */}
              <span className={cn('text-xs shrink-0 hidden sm:block', u.phone ? 'text-green-400' : 'text-red-400/50')}>
                {u.phone ? '📱' : 'Sin cel'}
              </span>

              {/* Date */}
              <span className="text-xs text-white/30 hidden sm:block shrink-0">
                {new Date(u.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>

              <span className="text-white/20 shrink-0">›</span>
            </Card>
          ))}
        </div>
      )}

      <UserActionsModal user={selectedUser} onClose={() => setSelectedUserId(null)} />
    </>
  )
}

// ─── User actions modal ───────────────────────────────────────
function UserActionsModal({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const { data: memberships, isLoading: loadingMemberships } = useAdminUserMemberships(user?.user_id ?? null)
  const { data: predStats } = useAdminUserPredictionStats(user?.user_id ?? null)
  const { data: reasonOptions = [] } = useFreepassReasons()
  const setMemberPaid = useAdminSetMemberPaid()
  const toggleFreePass = useToggleFreePass()
  const deleteUser = useAdminDeleteUser()
  const setOrganizer = useAdminSetOrganizer()
  const readOnly = useReadOnly()
  const isOrganizer = useIsOrganizerCtx()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [predView, setPredView] = useState<{ tournamentId: string; competition: string | null; hasCorazonada: boolean; hasSpecialPredictions: boolean } | null>(null)
  // Per-tournament payment dialog
  const [payDialog, setPayDialog] = useState<{ tournamentId: string; tournamentName: string; entryFee: number } | null>(null)
  const [payMethod, setPayMethod] = useState<'transfer' | 'freepass'>('transfer')
  const [payAmount, setPayAmount] = useState<string>('')
  const [payNote, setPayNote] = useState<string>('')

  function handleClose() {
    setConfirmDelete(false)
    setShowReasonModal(false)
    setPayDialog(null)
    setPredView(null)
    onClose()
  }

  function openPayDialog(m: AdminUserMembership) {
    setPayMethod('transfer')
    setPayAmount(String(m.entry_fee || ''))
    setPayNote('')
    setPayDialog({ tournamentId: m.tournament_id, tournamentName: m.tournament_name, entryFee: m.entry_fee })
  }

  async function confirmPay() {
    if (!user || !payDialog) return
    await setMemberPaid.mutateAsync({
      userId: user.user_id,
      tournamentId: payDialog.tournamentId,
      paid: true,
      amount: payMethod === 'transfer' ? (Number(payAmount) || null) : null,
      note: payMethod === 'freepass' ? (payNote || null) : (payNote || null),
    })
    setPayDialog(null)
  }

  function handleToggleFreePass() {
    if (!user) return
    if (!user.free_pass) {
      // Activar → pedir motivo
      setSelectedReason(user.freepass_reason ?? '')
      setShowReasonModal(true)
    } else {
      // Desactivar → directo
      toggleFreePass.mutate({ userId: user.user_id, freePass: false })
    }
  }

  async function confirmFreepass() {
    if (!user) return
    await toggleFreePass.mutateAsync({ userId: user.user_id, freePass: true, reason: selectedReason || null })
    setShowReasonModal(false)
  }

  return (
    <Modal open={!!user} onClose={handleClose} title="Gestionar usuario">
      {user && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-union-blue/15">
            <div className="w-10 h-10 rounded-full bg-union-blue/20 border border-union-blue/30 flex items-center justify-center overflow-hidden shrink-0">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-10 h-10 object-cover rounded-full" />
              ) : (
                <span className="text-sm font-bold text-union-blue">
                  {(user.username ?? user.email ?? '?')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">{user.username ?? '—'}</span>
                {user.user_is_admin && <Badge variant="blue"><ShieldAlert size={10} className="mr-1" />Admin</Badge>}
                {user.is_organizer && !user.user_is_admin && <Badge variant="blue"><Eye size={10} className="mr-1" />Organizador</Badge>}
                {user.free_pass && <Badge variant="green"><Ticket size={10} className="mr-1" />Pase libre</Badge>}
              </div>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
              <p className="text-xs mt-0.5">
                {user.phone
                  ? <span className="text-green-400">📱 {user.phone}</span>
                  : <span className="text-red-400/70">Sin celular registrado</span>}
              </p>
            </div>
          </div>

          {/* Progreso de pronósticos */}
          {predStats && (
            <div className="border border-union-blue/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Pronósticos cargados</p>
                <span className="text-sm font-bold text-white">
                  {predStats.predicted}
                  <span className="text-white/30 font-normal"> / {predStats.total}</span>
                </span>
              </div>
              <div className="w-full h-2 bg-union-navy rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    predStats.total === 0
                      ? 'w-0'
                      : predStats.predicted / predStats.total >= 0.8
                      ? 'bg-green-500'
                      : predStats.predicted / predStats.total >= 0.4
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  )}
                  style={{ width: predStats.total > 0 ? `${Math.round((predStats.predicted / predStats.total) * 100)}%` : '0%' }}
                />
              </div>
              <p className="text-[11px] text-white/30">
                {predStats.total === 0
                  ? 'Sin partidos cargados'
                  : `${Math.round((predStats.predicted / predStats.total) * 100)}% completado`}
              </p>
            </div>
          )}

          {/* Rol organizador (solo admin puede asignarlo) */}
          {!user.user_is_admin && !readOnly && (
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-sm text-white font-medium">Rol Organizador</p>
                <p className="text-xs text-white/40">Acceso de solo lectura al panel de admin</p>
              </div>
              <button
                onClick={() => setOrganizer.mutate({ userId: user.user_id, isOrganizer: !user.is_organizer })}
                disabled={setOrganizer.isPending}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                  user.is_organizer
                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    : 'bg-union-navy-light text-white/50 hover:text-white hover:bg-union-blue/20'
                )}
              >
                {user.is_organizer ? '✓ Organizador' : 'Sin rol'}
              </button>
            </div>
          )}

          {/* Pase libre global */}
          {!user.user_is_admin && (
            <div className="border border-union-blue/20 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Pase libre global</p>
                  {user.free_pass && user.freepass_reason ? (
                    <p className="text-xs text-yellow-400 mt-0.5">Motivo: {user.freepass_reason}</p>
                  ) : (
                    <p className="text-xs text-white/40">Exime del pago en todos los torneos</p>
                  )}
                </div>
                <button
                  onClick={handleToggleFreePass}
                  disabled={toggleFreePass.isPending || (readOnly && !isOrganizer)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    user.free_pass
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-union-navy-light text-white/50 hover:text-white hover:bg-union-blue/20'
                  )}
                >
                  {user.free_pass ? '✓ Activo' : 'Inactivo'}
                </button>
              </div>
            </div>
          )}

          {/* Freepass por torneo */}
          <div className="border border-union-blue/20 rounded-xl p-3 space-y-3">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Pago por torneo</p>
            {loadingMemberships ? (
              <p className="text-white/30 text-xs">Cargando...</p>
            ) : !memberships?.length ? (
              <p className="text-white/30 text-xs">No está inscripto en ningún torneo</p>
            ) : (
              memberships.map((m) => (
                <div key={m.tournament_id} className="flex items-center justify-between gap-2 py-1">
                  <div className="min-w-0">
                    <span className="text-sm text-white truncate block">{m.tournament_name}</span>
                    <span className="text-[11px] text-white/30">
                      {m.tournament_type === 'global' ? 'Global' : 'Amigos'}
                      {m.entry_fee > 0 ? ` · $${m.entry_fee.toLocaleString('es-AR')}` : ' · Gratis'}
                    </span>
                  </div>
                  {(() => {
                    const canEdit = !readOnly || (isOrganizer && m.tournament_type === 'global')
                    return (
                      <button
                        onClick={() => {
                          if (m.entry_fee === 0 || !canEdit) return
                          if (m.paid) {
                            setMemberPaid.mutate({ userId: user.user_id, tournamentId: m.tournament_id, paid: false })
                          } else {
                            openPayDialog(m)
                          }
                        }}
                        disabled={setMemberPaid.isPending || m.entry_fee === 0 || !canEdit}
                        className={cn(
                          'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                          m.entry_fee === 0
                            ? 'bg-union-navy-light text-white/20 cursor-default'
                            : m.paid
                            ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                            : canEdit
                            ? 'bg-union-navy-light text-white/50 hover:text-white hover:bg-union-blue/20'
                            : 'bg-union-navy-light text-white/20 cursor-default'
                        )}
                      >
                        {m.entry_fee === 0 ? 'Gratis' : m.paid ? '✓ Pagado' : 'Sin pago'}
                      </button>
                    )
                  })()}
                </div>
              ))
            )}
          </div>

          {/* Pronósticos del usuario */}
          {memberships && memberships.length > 0 && (
            <div className="border border-union-blue/20 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Ver pronósticos</p>
              <div className="flex flex-wrap gap-2">
                {memberships.map((m) => (
                  <button
                    key={m.tournament_id}
                    onClick={() => setPredView({
                      tournamentId: m.tournament_id,
                      competition: m.tournament_type === 'global' ? 'mundial_2026' : null,
                      hasCorazonada: m.tournament_type === 'global',
                      hasSpecialPredictions: m.tournament_type === 'global',
                    })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-union-navy border border-union-blue/20 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:border-union-blue/50 transition-colors"
                  >
                    📊 {m.tournament_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notificaciones */}
          <MundialArrancarBlast />

          {/* Zona peligrosa — solo admin */}
          {!user.user_is_admin && !readOnly && (
            <div className="border border-red-500/20 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-400/60 uppercase tracking-wider mb-2">Zona peligrosa</p>
              {confirmDelete ? (
                <div className="space-y-2">
                  <p className="text-xs text-white/60">
                    ¿Seguro? Se eliminarán la cuenta, perfil y todos los pronósticos de{' '}
                    <span className="text-white font-semibold">{user.username ?? user.email}</span>.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      onClick={async () => { await deleteUser.mutateAsync(user.user_id); handleClose() }}
                      loading={deleteUser.isPending}
                      className="flex-1"
                    >
                      Eliminar
                    </Button>
                    <Button variant="secondary" onClick={() => setConfirmDelete(false)} className="flex-1">Cancelar</Button>
                  </div>
                </div>
              ) : (
                <Button variant="danger" onClick={() => setConfirmDelete(true)} className="w-full">
                  <Trash2 size={14} className="mr-1.5" />Eliminar usuario
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: pronósticos del usuario */}
      {predView && user && (
        <UserPredictionsModal
          open
          onClose={() => setPredView(null)}
          entry={{
            user_id: user.user_id,
            username: user.username ?? user.email ?? '—',
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            total_points: 0,
            exact_scores: 0,
            correct_outcomes: 0,
            total_predictions: 0,
            rank: 0,
          }}
          tournamentId={predView.tournamentId}
          competition={predView.competition}
          isAdmin
          hasCorazonada={predView.hasCorazonada}
          hasSpecialPredictions={predView.hasSpecialPredictions}
        />
      )}

      {/* Modal: método y monto de pago por torneo */}
      {payDialog && user && (
        <Modal open onClose={() => setPayDialog(null)} title={`Registrar pago — ${payDialog.tournamentName}`}>
          <div className="space-y-4">
            <p className="text-xs text-white/50">
              Registrá el pago de <span className="text-white font-semibold">{user.username}</span> en este torneo.
            </p>

            {/* Método */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Método de pago</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setPayMethod('transfer'); setPayAmount(String(payDialog.entryFee || '')) }}
                  className={cn('py-3 rounded-xl text-sm font-semibold border transition-colors',
                    payMethod === 'transfer'
                      ? 'bg-green-500/20 border-green-500/40 text-green-400'
                      : 'bg-union-navy border-union-blue/20 text-white/50 hover:text-white'
                  )}
                >
                  💸 Transferencia
                </button>
                <button
                  onClick={() => { setPayMethod('freepass'); setPayAmount('') }}
                  className={cn('py-3 rounded-xl text-sm font-semibold border transition-colors',
                    payMethod === 'freepass'
                      ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                      : 'bg-union-navy border-union-blue/20 text-white/50 hover:text-white'
                  )}
                >
                  🎟️ Pase libre
                </button>
              </div>
            </div>

            {/* Monto (solo si es transferencia) */}
            {payMethod === 'transfer' && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Monto recibido</p>
                <div className="flex items-center gap-2 bg-union-navy border border-union-blue/30 rounded-xl px-4 py-2.5">
                  <span className="text-white/40 text-sm">$</span>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder={String(payDialog.entryFee || 0)}
                    className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                  />
                  <span className="text-white/30 text-xs">ARS</span>
                </div>
              </div>
            )}

            {/* Motivo */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                {payMethod === 'freepass' ? 'Motivo del pase libre' : 'Observación (opcional)'}
              </p>
              <select
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                className="w-full bg-union-navy border border-union-blue/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-union-blue"
              >
                <option value="">— Sin motivo —</option>
                {reasonOptions.map((r) => (
                  <option key={r.id} value={r.label}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="secondary" onClick={() => setPayDialog(null)} className="flex-1">Cancelar</Button>
              <Button onClick={confirmPay} loading={setMemberPaid.isPending} className="flex-1">
                Confirmar pago
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: selección de motivo de pase libre */}
      {showReasonModal && user && (
        <Modal open onClose={() => setShowReasonModal(false)} title="Motivo del pase libre">
          <div className="space-y-3">
            <p className="text-xs text-white/50">
              Seleccioná un motivo para darle pase libre a <span className="text-white font-semibold">{user.username}</span>.
            </p>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full bg-union-navy border border-union-blue/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-union-blue"
            >
              <option value="">— Sin motivo especificado —</option>
              {reasonOptions.map((r) => (
                <option key={r.id} value={r.label}>{r.label}</option>
              ))}
            </select>
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" onClick={() => setShowReasonModal(false)} className="flex-1">Cancelar</Button>
              <Button
                onClick={confirmFreepass}
                loading={toggleFreePass.isPending}
                className="flex-1"
              >
                Confirmar pase libre
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  )
}

// ─── Match form modal ─────────────────────────────────────────
function MatchFormModal({ match, onClose, onSave, loading }: {
  match: Partial<Match>; onClose: () => void; onSave: (d: MatchFormData) => Promise<void>; loading: boolean
}) {
  const isEdit = !!match.id
  const { register, handleSubmit, control, formState: { errors } } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema) as Resolver<MatchFormData>,
    defaultValues: {
      match_number: match.match_number ?? 1,
      stage: match.stage ?? 'group',
      group_name: match.group_name ?? '',
      home_team: match.home_team ?? '',
      away_team: match.away_team ?? '',
      home_flag: match.home_flag ?? '',
      away_flag: match.away_flag ?? '',
      match_date: match.match_date ? match.match_date.slice(0, 16) : '',
      venue: match.venue ?? '',
      home_score: match.home_score ?? undefined,
      away_score: match.away_score ?? undefined,
      penalty_winner: match.penalty_winner ?? '',
      status: match.status ?? 'upcoming',
      competition: match.competition ?? 'mundial_2026',
    },
  })

  const watchedStage = useWatch({ control, name: 'stage' })
  const watchedHome  = useWatch({ control, name: 'home_score' })
  const watchedAway  = useWatch({ control, name: 'away_score' })

  const KNOCKOUT = ['round_of_32','round_of_16','quarterfinal','semifinal','third_place','final']
  const showPenaltyField =
    KNOCKOUT.includes(watchedStage ?? '') &&
    watchedHome != null && watchedAway != null &&
    Number(watchedHome) === Number(watchedAway)

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Editar partido' : 'Nuevo partido'} className="max-w-lg">
      <form onSubmit={handleSubmit(onSave)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input label="N° Partido" type="number" error={errors.match_number?.message} {...register('match_number')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-union-blue-light">Etapa</label>
            <select className="bg-union-navy-light border border-union-blue/20 rounded-lg text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-union-blue" {...register('stage')}>
              {['group','round_of_32','round_of_16','quarterfinal','semifinal','third_place','final'].map((s) => (
                <option key={s} value={s}>{getStageName(s)}</option>
              ))}
            </select>
          </div>
        </div>
        <Input label="Grupo (A-L, dejar vacío en fase eliminatoria)" placeholder="A" {...register('group_name')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Equipo Local" placeholder="Argentina" error={errors.home_team?.message} {...register('home_team')} />
          <Input label="Bandera Local (emoji)" placeholder="🇦🇷" {...register('home_flag')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Equipo Visitante" placeholder="Brasil" error={errors.away_team?.message} {...register('away_team')} />
          <Input label="Bandera Visitante (emoji)" placeholder="🇧🇷" {...register('away_flag')} />
        </div>
        <Input label="Fecha y hora" type="datetime-local" error={errors.match_date?.message} {...register('match_date')} />
        <Input label="Estadio" placeholder="MetLife Stadium, Nueva York" {...register('venue')} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-union-blue-light">Competencia</label>
          <select className="bg-union-navy-light border border-union-blue/20 rounded-lg text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-union-blue" {...register('competition')}>
            <option value="mundial_2026">🌎 Mundial 2026</option>
            <option value="apertura_2026">🇦🇷 Apertura 2026</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Goles Local" type="number" min="0" placeholder="—" {...register('home_score')} />
          <Input label="Goles Visitante" type="number" min="0" placeholder="—" {...register('away_score')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-union-blue-light">Estado</label>
            <select className="bg-union-navy-light border border-union-blue/20 rounded-lg text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-union-blue" {...register('status')}>
              <option value="upcoming">Próximo</option>
              <option value="live">En vivo</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>
        </div>
        {showPenaltyField && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-union-blue-light">
              Ganador en penales{' '}
              <span className="text-yellow-400 text-xs">(empate en eliminatoria)</span>
            </label>
            <select
              className="bg-union-navy-light border border-yellow-500/40 rounded-lg text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              {...register('penalty_winner')}
            >
              <option value="">— Sin definir —</option>
              <option value="home">{match.home_team || 'Local'}</option>
              <option value="away">{match.away_team || 'Visitante'}</option>
            </select>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button type="submit" loading={loading} className="flex-1">
            <Save size={15} className="mr-1" />{isEdit ? 'Guardar cambios' : 'Crear partido'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            <X size={15} className="mr-1" />Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Tournament Types Tab ─────────────────────────────────────
const tournamentTypeSchema = z.object({
  name: z.string().min(1, 'Requerido').max(50),
  description: z.string().optional(),
  pts_exact: z.coerce.number().min(0).max(20),
  pts_outcome: z.coerce.number().min(0).max(20),
  pts_penalty_correct: z.coerce.number().min(0).max(10),
  pts_penalty_wrong_deduct: z.coerce.number().min(0).max(10),
  pts_penalty_wrong_deduct_draw_outcome: z.coerce.number().min(0).max(10),
  prediction_lock_hours: z.coerce.number().min(0).max(168),
  show_rival_predictions: z.enum(['before', 'after']),
  club_fee_percentage: z.coerce.number().min(0).max(100),
  requires_exact_score: z.boolean(),
  is_active: z.boolean(),
})
type TournamentTypeFormData = z.infer<typeof tournamentTypeSchema>

function TournamentTypesTab() {
  const { data: types = [], isLoading } = useAdminTournamentTypes()
  const [editTarget, setEditTarget] = useState<TournamentTypeAdmin | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  if (isLoading) return <p className="text-white/40">Cargando...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={15} className="mr-1" />Nuevo tipo
        </Button>
      </div>

      {types.length === 0 ? (
        <Card>
          <p className="text-white/40 text-sm text-center py-4">No hay tipos de torneo creados aún.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {types.map((t) => (
            <TypeRow key={t.id} type={t} onEdit={() => setEditTarget(t)} />
          ))}
        </div>
      )}

      {(createOpen || editTarget) && (
        <TournamentTypeModal
          type={editTarget}
          onClose={() => { setCreateOpen(false); setEditTarget(null) }}
        />
      )}

      <FreepassReasonsSection />
    </div>
  )
}

function FreepassReasonsSection() {
  const { data: reasons = [], isLoading, error } = useFreepassReasons()
  const addReason = useAddFreepassReason()
  const deleteReason = useDeleteFreepassReason()
  const [newLabel, setNewLabel] = useState('')
  const [savedMsg, setSavedMsg] = useState(false)

  async function handleAdd() {
    const label = newLabel.trim()
    if (!label) return
    await addReason.mutateAsync(label)
    setNewLabel('')
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2500)
  }

  return (
    <div className="mt-8">
      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Motivos de pase libre</p>
      <Card className="space-y-4 p-5">
        {isLoading ? (
          <p className="text-white/30 text-sm">Cargando...</p>
        ) : error ? (
          <p className="text-red-400 text-sm">Error al cargar motivos: {(error as Error).message}</p>
        ) : reasons.length === 0 ? (
          <p className="text-white/30 text-sm">No hay motivos configurados aún.</p>
        ) : (
          <div className="space-y-2">
            {reasons.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 bg-union-navy rounded-xl px-4 py-3">
                <span className="text-sm text-white">{r.label}</span>
                <button
                  onClick={() => deleteReason.mutate(r.id)}
                  disabled={deleteReason.isPending}
                  className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-center">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Nuevo motivo..."
            className="flex-1 bg-union-navy border border-union-blue/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-union-blue"
          />
          <Button onClick={handleAdd} loading={addReason.isPending} className="shrink-0 px-4">
            <Plus size={14} className="mr-1" />Agregar
          </Button>
        </div>
        {savedMsg && (
          <p className="text-green-400 text-sm font-medium">✓ Motivo guardado</p>
        )}
        {addReason.isError && (
          <p className="text-red-400 text-sm">{(addReason.error as Error).message}</p>
        )}
      </Card>
    </div>
  )
}

function TypeRow({ type, onEdit }: { type: TournamentTypeAdmin; onEdit: () => void }) {
  const toggle = useToggleTournamentTypeActive()

  return (
    <Card className={cn('space-y-2', !type.is_active && 'opacity-50')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white">{type.name}</p>
            <Badge variant={type.is_active ? 'green' : 'gray'}>
              {type.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          {type.description && (
            <p className="text-xs text-white/40 mt-0.5">{type.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" onClick={onEdit} className="px-2.5 py-1.5">
            <Edit2 size={13} />
          </Button>
          <Button
            variant="secondary"
            onClick={() => toggle.mutate({ id: type.id, is_active: !type.is_active })}
            className="px-2.5 py-1.5"
          >
            {type.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/50">
        <span className="col-span-2">Modo: <span className="text-white">{(type.requires_exact_score ?? true) ? 'Resultado exacto' : '1X2 (L/E/V)'}</span></span>
        <span>Exacto: <span className="text-white">{type.pts_exact}pts</span></span>
        <span>Resultado: <span className="text-white">{type.pts_outcome}pt</span></span>
        <span>Penal acierto: <span className="text-white">+{type.pts_penalty_correct}pt</span></span>
        <span>Penal error (exacto): <span className="text-white">−{type.pts_penalty_wrong_deduct}pt</span></span>
        <span className="col-span-2">Penal error (empate no exacto): <span className="text-white">−{type.pts_penalty_wrong_deduct_draw_outcome ?? 0}pt</span></span>
        <span>Cierre: <span className="text-white">{type.prediction_lock_hours}h antes</span></span>
        <span>Ver rivales: <span className="text-white">{type.show_rival_predictions === 'before' ? 'Antes' : 'Después'}</span></span>
        <span className="col-span-2">% Club: <span className="text-yellow-400 font-semibold">{type.club_fee_percentage}%</span></span>
      </div>
    </Card>
  )
}

function TournamentTypeModal({
  type,
  onClose,
}: {
  type: TournamentTypeAdmin | null
  onClose: () => void
}) {
  const upsert = useUpsertTournamentType()
  const isEdit = !!type

  const { register, handleSubmit, formState: { errors } } = useForm<TournamentTypeFormData>({
    resolver: zodResolver(tournamentTypeSchema) as Resolver<TournamentTypeFormData>,
    defaultValues: type
      ? {
          name: type.name,
          description: type.description ?? '',
          pts_exact: type.pts_exact,
          pts_outcome: type.pts_outcome,
          pts_penalty_correct: type.pts_penalty_correct,
          pts_penalty_wrong_deduct: type.pts_penalty_wrong_deduct,
          pts_penalty_wrong_deduct_draw_outcome: type.pts_penalty_wrong_deduct_draw_outcome ?? 0,
          prediction_lock_hours: type.prediction_lock_hours,
          show_rival_predictions: type.show_rival_predictions,
          club_fee_percentage: type.club_fee_percentage,
          requires_exact_score: type.requires_exact_score ?? true,
          is_active: type.is_active,
        }
      : {
          pts_exact: 3, pts_outcome: 1, pts_penalty_correct: 1, pts_penalty_wrong_deduct: 1,
          pts_penalty_wrong_deduct_draw_outcome: 0,
          prediction_lock_hours: 2, show_rival_predictions: 'after' as const,
          club_fee_percentage: 10, requires_exact_score: true, is_active: true,
        },
  })

  async function onSubmit(data: TournamentTypeFormData) {
    await upsert.mutateAsync({
      ...data,
      description: data.description ?? null,
      ...(type ? { id: type.id } : {}),
    })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Editar tipo de torneo' : 'Nuevo tipo de torneo'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nombre" placeholder="Ej: Normal" error={errors.name?.message} {...register('name')} />
        <Input label="Descripción (opcional)" placeholder="Breve explicación para los usuarios" {...register('description')} />

        <div className="border border-union-blue/20 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Puntajes</p>
          <div className="flex items-center gap-2 mb-1">
            <input type="checkbox" id="requires_exact_score" {...register('requires_exact_score')} className="accent-union-blue w-4 h-4" />
            <label htmlFor="requires_exact_score" className="text-sm text-white/70">Resultado exacto (desactivar para modo 1X2 L/E/V)</label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Exacto (pts)" type="number" min="0" max="20" error={errors.pts_exact?.message} {...register('pts_exact')} />
            <Input label="Resultado (pts)" type="number" min="0" max="20" error={errors.pts_outcome?.message} {...register('pts_outcome')} />
            <Input label="Penal acierto (+pts)" type="number" min="0" max="10" error={errors.pts_penalty_correct?.message} {...register('pts_penalty_correct')} />
            <Input label="Penal error, exacto (−pts)" type="number" min="0" max="10" error={errors.pts_penalty_wrong_deduct?.message} {...register('pts_penalty_wrong_deduct')} />
            <Input
              label="Penal error, empate no exacto (−pts)"
              type="number" min="0" max="10"
              error={errors.pts_penalty_wrong_deduct_draw_outcome?.message}
              {...register('pts_penalty_wrong_deduct_draw_outcome')}
            />
          </div>
        </div>

        <div className="border border-union-blue/20 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Configuración</p>
          <Input
            label="Cierre de pronósticos (horas antes del primer partido)"
            type="number" min="0" max="168"
            error={errors.prediction_lock_hours?.message}
            {...register('prediction_lock_hours')}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-union-blue-light">Ver pronósticos rivales</label>
            <select
              className="bg-union-navy-light border border-union-blue/20 rounded-lg text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-union-blue"
              {...register('show_rival_predictions')}
            >
              <option value="after">Solo después del partido</option>
              <option value="before">Antes del partido</option>
            </select>
          </div>
        </div>

        <div className="border border-yellow-500/30 rounded-xl p-4 space-y-3 bg-yellow-500/5">
          <p className="text-xs font-semibold text-yellow-400/70 uppercase tracking-wider">Solo admin — no visible para usuarios</p>
          <Input
            label="% para el club"
            type="number" min="0" max="100"
            error={errors.club_fee_percentage?.message}
            {...register('club_fee_percentage')}
          />
          <p className="text-xs text-white/30">El resto del pozo va al ganador del torneo.</p>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" {...register('is_active')} className="accent-union-blue w-4 h-4" />
          <label htmlFor="is_active" className="text-sm text-white/70">Tipo activo (visible para usuarios)</label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" loading={upsert.isPending} className="flex-1">
            <Save size={15} className="mr-1" />{isEdit ? 'Guardar cambios' : 'Crear tipo'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            <X size={15} className="mr-1" />Cancelar
          </Button>
        </div>
        {upsert.isError && (
          <p className="text-sm text-red-400">{String((upsert.error as Error).message)}</p>
        )}
      </form>
    </Modal>
  )
}

// ─── Torneos Tab ──────────────────────────────────────────────
interface AdminTournament {
  id: string
  name: string
  type?: 'global' | 'friend'
  created_by: string | null
  creator_username: string | null
  entry_fee: number
  member_count: number
  paid_count: number
  total_collected: number
  created_at: string
}

interface AdminMember {
  user_id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  paid: boolean
  joined_at: string
  payment_method: 'mercadopago' | 'online' | 'manual' | 'freepass' | null
  freepass_reason: string | null
  payment_note: string | null
  payment_amount: number | null
  prediction_count: number
  has_special_predictions: boolean
  is_active: boolean
}

interface AdminUserMembership {
  tournament_id: string
  tournament_name: string
  tournament_type: string
  entry_fee: number
  paid: boolean
  joined_at: string
}

function useAdminTournamentMembers(tournamentId: string | null) {
  return useQuery({
    queryKey: ['admin-tournament-members', tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_tournament_members', { p_tournament_id: tournamentId })
      if (error) throw error
      return (data ?? []) as AdminMember[]
    },
  })
}

function useAdminSetMemberPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, tournamentId, paid, amount, note }: {
      userId: string; tournamentId: string; paid: boolean; amount?: number | null; note?: string | null
    }) => {
      const { error } = await supabase.rpc('admin_set_member_paid', {
        p_user_id: userId,
        p_tournament_id: tournamentId,
        p_paid: paid,
        p_amount: amount ?? null,
        p_note: note ?? null,
      })
      if (error) throw error
    },
    onSuccess: (_, { tournamentId, userId }) => {
      qc.invalidateQueries({ queryKey: ['admin-tournament-members', tournamentId] })
      qc.invalidateQueries({ queryKey: ['admin-user-memberships', userId] })
      qc.invalidateQueries({ queryKey: ['admin-friend-tournaments'] })
      qc.invalidateQueries({ queryKey: ['admin-global-tournament-stats'] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

function useAdminSetMemberActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, tournamentId, active }: { userId: string; tournamentId: string; active: boolean }) => {
      const { error } = await supabase.rpc('admin_set_member_active', {
        p_user_id: userId,
        p_tournament_id: tournamentId,
        p_active: active,
      })
      if (error) throw error
    },
    onSuccess: (_, { tournamentId }) => {
      qc.invalidateQueries({ queryKey: ['admin-tournament-members', tournamentId] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}

function useAdminUserMemberships(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-memberships', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_user_memberships', { p_user_id: userId })
      if (error) throw error
      return (data ?? []) as AdminUserMembership[]
    },
  })
}

function useAdminUserPredictionStats(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-prediction-stats', userId],
    enabled: !!userId,
    queryFn: async () => {
      const [predsRes, matchesRes] = await Promise.all([
        supabase
          .from('predictions')
          .select('match_id', { count: 'exact', head: true })
          .eq('user_id', userId!),
        supabase
          .from('matches')
          .select('id', { count: 'exact', head: true }),
      ])
      return {
        predicted: predsRes.count ?? 0,
        total: matchesRes.count ?? 0,
      }
    },
  })
}

function useAdminUpdateTournamentName() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ tournamentId, name }: { tournamentId: string; name: string }) => {
      const { error } = await supabase.rpc('admin_update_tournament_name', {
        p_tournament_id: tournamentId,
        p_name: name,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-friend-tournaments'] }),
  })
}

function useAdminDeleteTournament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { error } = await supabase.rpc('admin_delete_tournament', { p_tournament_id: tournamentId })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-friend-tournaments'] }),
  })
}

interface GlobalTournamentStats {
  tournament_id: string
  tournament_name: string
  entry_fee: number
  total_members: number
  paid_members: number
  total_collected: number
  mp_collected: number
  manual_collected: number
}

function useGlobalTournamentStats() {
  return useQuery({
    queryKey: ['admin-global-tournament-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_global_tournament_stats')
      if (error) throw error
      return (data ?? []) as GlobalTournamentStats[]
    },
  })
}

function useFriendTournaments() {
  return useQuery({
    queryKey: ['admin-friend-tournaments'],
    queryFn: async () => {
      // Intentamos con el RPC seguro (requiere migration 033 en Supabase).
      // Si no existe todavía, usamos el fallback con PostgREST.
      const rpcRes = await supabase.rpc('admin_get_friend_tournaments')

      let tournaments: any[]
      let memberCountMap: Record<string, number> = {}

      if (!rpcRes.error && rpcRes.data) {
        // RPC disponible → counts exactos (bypasa RLS)
        tournaments = rpcRes.data
        memberCountMap = Object.fromEntries(rpcRes.data.map((t: any) => [t.id, Number(t.member_count ?? 0)]))
      } else {
        // Fallback: query directa (count puede estar limitado por RLS)
        const { data, error } = await supabase
          .from('tournaments')
          .select('id, name, created_by, entry_fee, created_at, tournament_members(count)')
          .eq('type', 'friends')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        if (error) throw error
        tournaments = data ?? []
        memberCountMap = Object.fromEntries(
          tournaments.map((t: any) => [t.id, Number(t.tournament_members?.[0]?.count ?? 0)])
        )
      }

      const [paymentsRes, profilesRes] = await Promise.all([
        supabase.from('payments').select('tournament_id, status, amount').eq('status', 'approved'),
        (() => {
          const ids = [...new Set(tournaments.map((t: any) => t.created_by).filter(Boolean))]
          return ids.length > 0
            ? supabase.from('profiles').select('id, username').in('id', ids)
            : Promise.resolve({ data: [] })
        })(),
      ])

      const payments: any[] = paymentsRes.data ?? []
      const usernameMap = Object.fromEntries(((profilesRes as any).data ?? []).map((p: any) => [p.id, p.username]))

      return tournaments.map((t: any) => {
        const approved = payments.filter((p: any) => p.tournament_id === t.id)
        return {
          id: t.id,
          name: t.name,
          created_by: t.created_by,
          creator_username: t.created_by ? (usernameMap[t.created_by] ?? '—') : '—',
          entry_fee: t.entry_fee,
          member_count: memberCountMap[t.id] ?? 0,
          paid_count: approved.length,
          total_collected: approved.reduce((sum: number, p: any) => sum + p.amount, 0),
          created_at: t.created_at,
        } as AdminTournament
      })
    },
  })
}

function TorneosTab() {
  const { data: tournaments, isLoading } = useFriendTournaments()
  const { data: globalStats, isLoading: isLoadingGlobal } = useGlobalTournamentStats()
  const updateName = useAdminUpdateTournamentName()
  const deleteTournament = useAdminDeleteTournament()
  const [membersOf, setMembersOf] = useState<AdminTournament | null>(null)
  const [globalMembersOf, setGlobalMembersOf] = useState<AdminTournament | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const totalRecaudado = (tournaments ?? []).reduce((sum, t) => sum + t.total_collected, 0)

  function startEdit(e: React.MouseEvent, t: AdminTournament) {
    e.stopPropagation()
    setEditId(t.id)
    setEditName(t.name)
  }

  async function saveEdit() {
    if (!editId || !editName.trim()) { setEditId(null); return }
    await updateName.mutateAsync({ tournamentId: editId, name: editName.trim() })
    setEditId(null)
  }

  async function confirmDelete(id: string) {
    await deleteTournament.mutateAsync(id)
    setConfirmDeleteId(null)
  }

  return (
    <>
      {/* Torneo Global */}
      {!isLoadingGlobal && (globalStats ?? []).map((g) => (
        <div key={g.tournament_id} className="mb-6">
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Torneo General</p>
          <Card
            className="bg-union-navy-light border border-union-blue/20 cursor-pointer hover:border-union-blue/50 transition-colors"
            onClick={() => setGlobalMembersOf({
              id: g.tournament_id,
              name: g.tournament_name,
              type: 'global',
              created_by: null,
              creator_username: null,
              entry_fee: Number(g.entry_fee),
              member_count: Number(g.total_members),
              paid_count: Number(g.paid_members),
              total_collected: Number(g.total_collected),
              created_at: '',
            })}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-union-blue/30 rounded-xl flex items-center justify-center shrink-0">
                <Trophy size={18} className="text-union-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold text-white">{g.tournament_name}</span>
                  <span className="text-xs text-yellow-400 font-medium">${Number(g.entry_fee).toLocaleString('es-AR')} ARS</span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">Hacé clic para ver la lista de participantes</p>
              </div>
            </div>

            {/* Stats principales */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-union-navy rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-white">{g.total_members}</p>
                <p className="text-xs text-white/40 mt-0.5">participantes</p>
              </div>
              <div className="bg-union-navy rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-400">{g.paid_members}</p>
                <p className="text-xs text-white/40 mt-0.5">pagaron</p>
              </div>
              <div className="bg-union-navy rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-400">{g.total_members - g.paid_members}</p>
                <p className="text-xs text-white/40 mt-0.5">sin pago</p>
              </div>
            </div>

            {/* Desglose recaudado */}
            <div className="bg-union-navy rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Recaudado</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Total general</span>
                <span className="text-base font-bold text-yellow-400">${Number(g.total_collected).toLocaleString('es-AR')}</span>
              </div>
              <div className="border-t border-union-blue/10 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-300/80 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                    MercadoPago
                  </span>
                  <span className="text-sm font-semibold text-blue-300">${Number(g.mp_collected).toLocaleString('es-AR')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-300/80 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                    Transferencias manuales
                  </span>
                  <span className="text-sm font-semibold text-green-300">${Number(g.manual_collected).toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            {g.total_members > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-white/40 mb-1.5">
                  <span>Pagos recibidos</span>
                  <span>{g.paid_members}/{g.total_members}</span>
                </div>
                <div className="h-2 bg-union-navy rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(g.paid_members / g.total_members) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      ))}

      {/* Torneos de Amigos */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <p className="text-white/40 text-sm">{tournaments?.length ?? 0} torneos de amigos</p>
        {totalRecaudado > 0 && (
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-green-400 text-sm font-semibold">Total recaudado: ${totalRecaudado.toLocaleString('es-AR')} ARS</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="text-white/40 text-sm">Cargando torneos...</p>
      ) : (tournaments ?? []).length === 0 ? (
        <Card className="text-center py-8">
          <Trophy size={28} className="text-white/20 mx-auto mb-2" />
          <p className="text-white/40 text-sm">No hay torneos de amigos creados</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {(tournaments ?? []).map((t) => (
            <Card key={t.id} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-union-blue/20 rounded-xl flex items-center justify-center shrink-0">
                <Trophy size={16} className="text-union-blue" />
              </div>
              <div className="flex-1 min-w-0">
                {editId === t.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditId(null) }}
                    className="w-full bg-union-navy border border-union-blue/40 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-union-blue"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white truncate">{t.name}</span>
                    {t.entry_fee === 0
                      ? <span className="text-xs text-green-400 font-medium">Gratis</span>
                      : <span className="text-xs text-yellow-400 font-medium">${t.entry_fee.toLocaleString('es-AR')} ARS</span>
                    }
                  </div>
                )}
                <p className="text-xs text-white/40 mt-0.5">
                  Creado por <span className="text-white/60">{t.creator_username}</span>
                  {t.entry_fee > 0 && (
                    <> · <span className="text-white/30">{t.paid_count}/{t.member_count} pagaron</span></>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {t.entry_fee > 0 && (
                  <div className="text-right mr-2 hidden sm:block">
                    <p className="text-xs text-white/50">{t.member_count} participantes</p>
                    <p className="text-xs text-green-400 font-semibold">${t.total_collected.toLocaleString('es-AR')} rec.</p>
                  </div>
                )}
                {t.entry_fee === 0 && (
                  <span className="text-xs text-white/30 mr-2 hidden sm:block">{t.member_count} part.</span>
                )}
                <button
                  onClick={(e) => startEdit(e, t)}
                  className="p-1.5 text-white/40 hover:text-union-blue transition-colors"
                  title="Editar nombre"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setMembersOf(t)}
                  className="p-1.5 text-white/40 hover:text-white transition-colors"
                  title="Ver participantes"
                >
                  <Users size={14} />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(t.id)}
                  className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                  title="Eliminar torneo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {membersOf && (
        <TournamentMembersModal tournament={membersOf} onClose={() => setMembersOf(null)} />
      )}

      {globalMembersOf && (
        <TournamentMembersModal tournament={globalMembersOf} onClose={() => setGlobalMembersOf(null)} />
      )}

      {confirmDeleteId && (
        <Modal open onClose={() => setConfirmDeleteId(null)} title="Eliminar torneo">
          <p className="text-white/70 text-sm mb-4">
            ¿Seguro que querés eliminar este torneo? Se borrarán todos los participantes. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
            <Button
              onClick={() => confirmDelete(confirmDeleteId)}
              disabled={deleteTournament.isPending}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
            >
              {deleteTournament.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── Tournament members modal ─────────────────────────────────
function PaymentMethodBadge({ method, reason }: { method: AdminMember['payment_method']; reason: string | null }) {
  if (method === 'mercadopago') return (
    <span className="shrink-0 text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg font-semibold">MercadoPago</span>
  )
  if (method === 'online') return (
    <span className="shrink-0 text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg font-semibold">Online</span>
  )
  if (method === 'freepass') return (
    <span className="shrink-0 text-xs bg-yellow-500/20 text-yellow-300 px-2.5 py-1 rounded-lg font-semibold" title={reason ?? ''}>
      Pase libre{reason ? ` · ${reason}` : ''}
    </span>
  )
  if (method === 'manual') return (
    <span className="shrink-0 text-xs bg-green-500/15 text-green-300 px-2.5 py-1 rounded-lg font-semibold">Transferencia</span>
  )
  return null
}

type MemberSortKey = 'username' | 'joined_at' | 'payment_amount' | 'paid' | 'prediction_count'

function TournamentMembersModal({ tournament, onClose }: { tournament: AdminTournament; onClose: () => void }) {
  const { data: members = [], isLoading } = useAdminTournamentMembers(tournament.id)
  const setMemberPaid = useAdminSetMemberPaid()
  const setMemberActive = useAdminSetMemberActive()
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'inactive'>('all')
  const [sortKey, setSortKey] = useState<MemberSortKey>('paid')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [confirmBulk, setConfirmBulk] = useState(false)

  function handleSort(key: MemberSortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'username' ? 'asc' : 'desc') }
  }

  // is_active puede ser undefined si el RPC viejo no lo retorna → tratarlo como true
  const isActive = (m: AdminMember) => m.is_active !== false
  const activeMembers = members.filter(m => isActive(m))
  const inactiveMembers = members.filter(m => !isActive(m))
  // Candidatos a deshabilitar: sin pago, sin pronósticos, activos aún
  const inactiveCandidates = activeMembers.filter(m => !m.paid && (m.prediction_count ?? 1) === 0)

  const baseFiltered = filter === 'inactive' ? inactiveMembers
    : filter === 'paid' ? activeMembers.filter(m => m.paid)
    : filter === 'unpaid' ? activeMembers.filter(m => !m.paid)
    : [...activeMembers, ...inactiveMembers]  // 'all': activos primero, inactivos griseados al final
  const filtered = [...baseFiltered].sort((a, b) => {
    let diff = 0
    if (sortKey === 'username') diff = (a.username ?? '').localeCompare(b.username ?? '')
    else if (sortKey === 'joined_at') diff = a.joined_at.localeCompare(b.joined_at)
    else if (sortKey === 'payment_amount') diff = (a.payment_amount ?? 0) - (b.payment_amount ?? 0)
    else if (sortKey === 'paid') diff = (a.paid ? 1 : 0) - (b.paid ? 1 : 0)
    else if (sortKey === 'prediction_count') diff = (a.prediction_count ?? 0) - (b.prediction_count ?? 0)
    return sortDir === 'asc' ? diff : -diff
  })

  const paidCount = members.filter(m => m.paid).length
  const totalCollected = members.filter(m => m.paid && m.payment_amount).reduce((sum, m) => sum + (m.payment_amount ?? 0), 0)

  async function handleBulkDisable() {
    setConfirmBulk(false)
    for (const m of inactiveCandidates.filter(m => m.is_active)) {
      await setMemberActive.mutateAsync({ userId: m.user_id, tournamentId: tournament.id, active: false })
    }
  }

  return (
    <Modal open onClose={onClose} title={`Participantes — ${tournament.name}`} className="max-w-3xl">
      {/* Resumen */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-union-blue/10 flex-wrap">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{activeMembers.length}</p>
          <p className="text-xs text-white/40">activos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{paidCount}</p>
          <p className="text-xs text-white/40">pagaron</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">{activeMembers.length - paidCount}</p>
          <p className="text-xs text-white/40">sin pago</p>
        </div>
        {inactiveMembers.length > 0 && (
          <div className="text-center">
            <p className="text-2xl font-bold text-white/30">{inactiveMembers.length}</p>
            <p className="text-xs text-white/30">inactivos</p>
          </div>
        )}
        {totalCollected > 0 && (
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">${totalCollected.toLocaleString('es-AR')}</p>
            <p className="text-xs text-white/40">recaudado</p>
          </div>
        )}
        {/* Filtros */}
        <div className="ml-auto flex gap-1 flex-wrap">
          {(['all', 'paid', 'unpaid', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
                filter === f
                  ? f === 'inactive' ? 'bg-red-500/30 text-red-300' : 'bg-union-blue text-white'
                  : 'bg-union-navy text-white/40 hover:text-white'
              )}>
              {f === 'all' ? 'Activos' : f === 'paid' ? 'Pagaron' : f === 'unpaid' ? 'Sin pago' : `Inactivos (${inactiveMembers.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action para deshabilitar candidatos */}
      {filter !== 'inactive' && inactiveCandidates.filter(m => m.is_active).length > 0 && (
        <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-between gap-3">
          <p className="text-xs text-orange-300">
            <span className="font-semibold">{inactiveCandidates.filter(m => m.is_active).length} usuarios</span> sin pago y sin pronósticos
          </p>
          {confirmBulk ? (
            <div className="flex gap-2">
              <button onClick={handleBulkDisable} className="px-3 py-1 rounded-lg bg-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/40">Sí, deshabilitar</button>
              <button onClick={() => setConfirmBulk(false)} className="px-3 py-1 rounded-lg bg-white/10 text-white/40 text-xs font-medium">Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setConfirmBulk(true)} className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-300 text-xs font-semibold hover:bg-orange-500/30 whitespace-nowrap">
              Deshabilitar todos
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <p className="text-white/40 text-sm py-4 text-center">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/40 text-sm text-center py-6">Sin participantes en este filtro</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider border-b border-union-blue/10">
                {([
                  { col: 'username' as MemberSortKey, label: 'Participante', align: 'left' },
                  { col: 'joined_at' as MemberSortKey, label: 'Ingresó', align: 'left' },
                  { col: null, label: 'Método', align: 'left' },
                  { col: 'payment_amount' as MemberSortKey, label: 'Monto', align: 'right' },
                  { col: 'paid' as MemberSortKey, label: 'Estado', align: 'right' },
                ]).map(({ col, label, align }) => (
                  <th
                    key={label}
                    onClick={col ? () => handleSort(col) : undefined}
                    className={cn(
                      `text-${align} pb-2 font-semibold transition-colors`,
                      col ? 'cursor-pointer select-none hover:text-white' : '',
                      col && sortKey === col ? 'text-white' : 'text-white/30',
                    )}
                  >
                    {label}
                    {col && (sortKey === col
                      ? (sortDir === 'asc' ? <ChevronUp size={10} className="ml-0.5 inline" /> : <ChevronDown size={10} className="ml-0.5 inline" />)
                      : <ChevronUp size={10} className="ml-0.5 inline opacity-20" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-union-blue/5">
              {filtered.map((m) => (
                <tr key={m.user_id} className={cn('transition-colors', isActive(m) ? 'hover:bg-union-blue/5' : 'opacity-40')}>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-union-blue/20 border border-union-blue/30 flex items-center justify-center overflow-hidden shrink-0">
                        {m.avatar_url ? (
                          <img src={m.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover grayscale" />
                        ) : (
                          <span className="text-xs font-bold text-union-blue">
                            {(m.username ?? '?')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-white truncate block max-w-[140px]">{m.username ?? '—'}</span>
                        {!isActive(m) && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white/50 whitespace-nowrap">Deshabilitado</span>
                        )}
                        {isActive(m) && tournament.type === 'global' && m.prediction_count > 0 && !m.has_special_predictions && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 whitespace-nowrap">Sin especiales</span>
                        )}
                        {isActive(m) && tournament.type === 'global' && m.prediction_count === 0 && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400/70 whitespace-nowrap">Sin pronósticos</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-white/40 whitespace-nowrap">
                    {new Date(m.joined_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-2.5 pr-4">
                    {m.paid ? <PaymentMethodBadge method={m.payment_method} reason={m.freepass_reason} /> : <span className="text-white/20">—</span>}
                  </td>
                  <td className="py-2.5 pr-4 text-right whitespace-nowrap">
                    {m.payment_amount != null
                      ? <span className="text-yellow-400 font-semibold">${m.payment_amount.toLocaleString('es-AR')}</span>
                      : m.paid && m.payment_method === 'freepass'
                        ? <span className="text-white/30">Free pass</span>
                        : <span className="text-white/20">—</span>
                    }
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {tournament.entry_fee > 0 ? (
                        <button
                          onClick={() => setMemberPaid.mutate({ userId: m.user_id, tournamentId: tournament.id, paid: !m.paid })}
                          disabled={setMemberPaid.isPending}
                          className={cn(
                            'px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap',
                            m.paid
                              ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                              : 'bg-union-navy text-white/50 hover:text-white hover:bg-union-blue/20'
                          )}
                        >
                          {m.paid ? '✓ Pagado' : 'Sin pago'}
                        </button>
                      ) : (
                        <span className="text-xs text-white/20">Gratis</span>
                      )}
                      <button
                        onClick={() => setMemberActive.mutate({ userId: m.user_id, tournamentId: tournament.id, active: !m.is_active })}
                        disabled={setMemberActive.isPending}
                        title={m.is_active ? 'Deshabilitar usuario' : 'Reactivar usuario'}
                        className={cn(
                          'px-2 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap',
                          m.is_active
                            ? 'bg-white/5 text-white/20 hover:bg-red-500/20 hover:text-red-400'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        )}
                      >
                        {m.is_active ? '⛔' : '✓ Reactivar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-white/30 mt-4 pt-3 border-t border-union-blue/10 text-right">
        {filtered.length} de {members.length} participante{members.length !== 1 ? 's' : ''}
      </p>
    </Modal>
  )
}

function BlastButton({ blastType, label, confirmText }: { blastType: string; label: string; confirmText: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [sent, setSent] = useState<number>(0)
  const [confirm, setConfirm] = useState(false)

  async function handleSend() {
    setStatus('sending')
    setConfirm(false)
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const res = await fetch(`${supabaseUrl}/functions/v1/send-prediction-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-reminder-secret': 'prode-reminder-2026' },
        body: JSON.stringify({ blast_type: blastType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      setSent(data.sent ?? 0)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') return <p className="text-xs text-green-400 py-1">✓ Enviado a {sent} participantes</p>
  if (status === 'error') return <p className="text-xs text-red-400 py-1">✗ Error al enviar. Intentá de nuevo.</p>
  if (confirm) return (
    <div className="space-y-2">
      <p className="text-xs text-white/60">{confirmText}</p>
      <div className="flex gap-2">
        <button onClick={handleSend} className="flex-1 py-2 rounded-lg bg-union-blue text-white text-xs font-semibold">Sí, enviar</button>
        <button onClick={() => setConfirm(false)} className="flex-1 py-2 rounded-lg bg-union-navy-light text-white/50 text-xs font-medium">Cancelar</button>
      </div>
    </div>
  )
  return (
    <button
      onClick={() => setConfirm(true)}
      disabled={status === 'sending'}
      className="w-full py-2 rounded-lg bg-union-navy-light hover:bg-union-blue/20 text-white/70 hover:text-white text-xs font-medium transition-colors disabled:opacity-40"
    >
      {status === 'sending' ? '⏳ Enviando...' : label}
    </button>
  )
}

function MundialArrancarBlast() {
  return (
    <div className="border border-union-blue/10 rounded-xl p-3 space-y-2">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Notificaciones</p>
      <BlastButton
        blastType="mundial_final"
        label="⚽ Email cuenta regresiva + especiales"
        confirmText="Enviará a todos los participantes del torneo global el email con cuenta regresiva y recordatorio de especiales."
      />
      <BlastButton
        blastType="mundial_arranca"
        label='✉️ Email "arranca el Mundial" (pago + especiales)'
        confirmText='¿Confirmar envío del email "arranca el Mundial" a todos los participantes?'
      />
    </div>
  )
}
