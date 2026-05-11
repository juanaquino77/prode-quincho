import { useState } from 'react'
import { useForm, type Resolver, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit2, Trash2, Save, X, Users, Calendar, ShieldAlert, ClipboardList, Layers, Eye, EyeOff } from 'lucide-react'
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

// ─── Types ────────────────────────────────────────────────────
interface AdminUser {
  user_id: string
  email: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  user_is_admin: boolean
  created_at: string
}

// ─── Hooks ────────────────────────────────────────────────────
function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_users')
      if (error) throw error
      // RETURNS json → data is already the parsed array
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
type Tab = 'results' | 'matches' | 'users' | 'types'

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('results')

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
        <p className="text-white/50 text-sm mt-0.5">Gestión de partidos, usuarios y tipos de torneo</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-union-blue/15 pb-0 overflow-x-auto">
        {([
          { id: 'results', label: 'Resultados', icon: ClipboardList },
          { id: 'matches', label: 'Partidos',   icon: Calendar },
          { id: 'users',   label: 'Usuarios',   icon: Users },
          { id: 'types',   label: 'Tipos',      icon: Layers },
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
    </Layout>
  )
}

// ─── Results tab ──────────────────────────────────────────────
function ResultsTab() {
  const { data: matches, isLoading } = useMatches()
  const upsert = useUpsertMatch()
  const [scores, setScores] = useState<Record<string, { home: string; away: string; pen: string; status: string }>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  // Show only non-group matches (knockout) not yet finished, sorted by date
  const relevant = (matches ?? [])
    .filter((m) => m.stage !== 'group')
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

  // Nombres resueltos solo para display — el save usa el match original para no pisar la BD
  const resolvedById = new Map(resolveMatches(matches ?? []).map((r) => [r.id, r]))

  function getRow(m: Match) {
    return scores[m.id] ?? {
      home: m.home_score?.toString() ?? '',
      away: m.away_score?.toString() ?? '',
      pen: m.penalty_winner ?? '',
      status: m.status,
    }
  }

  function setField(id: string, field: string, val: string) {
    setScores((prev) => ({ ...prev, [id]: { ...getRow({ id } as Match), ...scores[id], [field]: val } }))
  }

  async function handleSave(m: Match) {
    const row = getRow(m)
    const home = parseInt(row.home)
    const away = parseInt(row.away)
    await upsert.mutateAsync({
      ...m,
      home_score: isNaN(home) ? null : home,
      away_score: isNaN(away) ? null : away,
      penalty_winner: (row.pen || null) as 'home' | 'away' | null,
      status: row.status as Match['status'],
    })
    setSaved((prev) => ({ ...prev, [m.id]: true }))
    setTimeout(() => setSaved((prev) => ({ ...prev, [m.id]: false })), 2000)
  }

  const KNOCKOUT = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']

  if (isLoading) return <p className="text-white/40">Cargando...</p>

  return (
    <div className="space-y-2">
      {relevant.map((m) => {
        const row = getRow(m)
        const homeVal = parseInt(row.home)
        const awayVal = parseInt(row.away)
        const isDraw = !isNaN(homeVal) && !isNaN(awayVal) && homeVal === awayVal
        const isKnockout = KNOCKOUT.includes(m.stage)
        const showPen = isKnockout && isDraw

        return (
          <Card key={m.id} className="space-y-2">
            {/* Match header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant={m.status === 'finished' ? 'gray' : m.status === 'live' ? 'green' : 'blue'}>
                  {getStageName(m.stage)}
                </Badge>
                <span className="text-xs text-white/40">{formatShortDate(m.match_date)}</span>
              </div>
              <select
                value={row.status}
                onChange={(e) => setField(m.id, 'status', e.target.value)}
                className="text-xs bg-union-navy-light border border-union-blue/20 rounded-lg text-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-union-blue"
              >
                <option value="upcoming">Próximo</option>
                <option value="live">En vivo</option>
                <option value="finished">Finalizado</option>
              </select>
            </div>

            {/* Score row */}
            <div className="flex items-center gap-2">
              <span className="flex-1 text-sm font-semibold text-white truncate text-right">{resolvedById.get(m.id)?.home_team ?? m.home_team}</span>
              <input
                type="number" min="0" max="20"
                value={row.home}
                onChange={(e) => setField(m.id, 'home', e.target.value)}
                className="w-12 h-9 text-center bg-union-navy border border-union-blue/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-union-blue"
                placeholder="—"
              />
              <span className="text-white/30 text-xs font-bold">-</span>
              <input
                type="number" min="0" max="20"
                value={row.away}
                onChange={(e) => setField(m.id, 'away', e.target.value)}
                className="w-12 h-9 text-center bg-union-navy border border-union-blue/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-union-blue"
                placeholder="—"
              />
              <span className="flex-1 text-sm font-semibold text-white truncate">{resolvedById.get(m.id)?.away_team ?? m.away_team}</span>
              <Button size="sm" onClick={() => handleSave(m)} loading={upsert.isPending} className="shrink-0">
                {saved[m.id] ? '✓' : <Save size={13} />}
              </Button>
            </div>

            {/* Penalty row */}
            {showPen && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-yellow-400 font-semibold">Pen:</span>
                <select
                  value={row.pen}
                  onChange={(e) => setField(m.id, 'pen', e.target.value)}
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
      })}
      {relevant.length === 0 && (
        <Card className="text-center py-8 text-white/40 text-sm">No hay partidos eliminatorios cargados</Card>
      )}
    </div>
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
  const deleteUser = useAdminDeleteUser()
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)

  async function handleDelete() {
    if (!confirmDelete) return
    await deleteUser.mutateAsync(confirmDelete.user_id)
    setConfirmDelete(null)
  }

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
            <Card key={u.user_id} className="flex items-center gap-3">
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white truncate">
                    {u.username ?? '—'}
                  </span>
                  {u.user_is_admin && (
                    <Badge variant="blue">
                      <ShieldAlert size={10} className="mr-1" />Admin
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white/40 truncate">{u.email}</p>
              </div>

              {/* Date */}
              <span className="text-xs text-white/30 hidden sm:block shrink-0">
                {new Date(u.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>

              {/* Delete */}
              {!u.user_is_admin && (
                <button
                  onClick={() => setConfirmDelete(u)}
                  className="p-1.5 text-white/30 hover:text-red-400 transition-colors shrink-0"
                  title="Eliminar usuario"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Eliminar usuario">
        <p className="text-white/70 mb-1">
          ¿Seguro que querés eliminar a{' '}
          <span className="text-white font-semibold">{confirmDelete?.username ?? confirmDelete?.email}</span>?
        </p>
        <p className="text-white/40 text-xs mb-4">
          Se eliminarán su cuenta, perfil y todos sus pronósticos. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleDelete} loading={deleteUser.isPending} className="flex-1">
            Eliminar usuario
          </Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)} className="flex-1">
            Cancelar
          </Button>
        </div>
      </Modal>
    </>
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
  prediction_lock_hours: z.coerce.number().min(0).max(168),
  show_rival_predictions: z.enum(['before', 'after']),
  club_fee_percentage: z.coerce.number().min(0).max(100),
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
        <span>Exacto: <span className="text-white">{type.pts_exact}pts</span></span>
        <span>Resultado: <span className="text-white">{type.pts_outcome}pt</span></span>
        <span>Penal acierto: <span className="text-white">+{type.pts_penalty_correct}pt</span></span>
        <span>Penal error: <span className="text-white">−{type.pts_penalty_wrong_deduct}pt</span></span>
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
          prediction_lock_hours: type.prediction_lock_hours,
          show_rival_predictions: type.show_rival_predictions,
          club_fee_percentage: type.club_fee_percentage,
          is_active: type.is_active,
        }
      : {
          pts_exact: 3, pts_outcome: 1, pts_penalty_correct: 1, pts_penalty_wrong_deduct: 1,
          prediction_lock_hours: 2, show_rival_predictions: 'after',
          club_fee_percentage: 10, is_active: true,
        },
  })

  async function onSubmit(data: TournamentTypeFormData) {
    await upsert.mutateAsync({ ...data, ...(type ? { id: type.id } : {}) })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Editar tipo de torneo' : 'Nuevo tipo de torneo'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nombre" placeholder="Ej: Normal" error={errors.name?.message} {...register('name')} />
        <Input label="Descripción (opcional)" placeholder="Breve explicación para los usuarios" {...register('description')} />

        <div className="border border-union-blue/20 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Puntajes</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Exacto (pts)" type="number" min="0" max="20" error={errors.pts_exact?.message} {...register('pts_exact')} />
            <Input label="Resultado (pts)" type="number" min="0" max="20" error={errors.pts_outcome?.message} {...register('pts_outcome')} />
            <Input label="Penal acierto (+pts)" type="number" min="0" max="10" error={errors.pts_penalty_correct?.message} {...register('pts_penalty_correct')} />
            <Input label="Penal error (−pts)" type="number" min="0" max="10" error={errors.pts_penalty_wrong_deduct?.message} {...register('pts_penalty_wrong_deduct')} />
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
