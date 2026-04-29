import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { useMatches, useUpsertMatch, useDeleteMatch } from '../hooks/useMatches'
import { formatShortDate, getStageName } from '../lib/utils'
import type { Match, MatchStage } from '../types'

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
  status: z.enum(['upcoming', 'live', 'finished']),
})
type MatchFormData = z.infer<typeof matchSchema>

export default function Admin() {
  const { data: matches, isLoading } = useMatches()
  const upsert = useUpsertMatch()
  const deleteMatch = useDeleteMatch()
  const [editMatch, setEditMatch] = useState<Partial<Match> | null>(null)
  const [filterStage, setFilterStage] = useState('group')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = matches?.filter((m) => m.stage === filterStage) ?? []

  function openNew() {
    setEditMatch({ stage: filterStage as MatchStage, status: 'upcoming', group_name: null })
  }

  async function handleDelete(id: string) {
    await deleteMatch.mutateAsync(id)
    setConfirmDelete(null)
  }

  const STAGES = ['group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          <p className="text-white/50 text-sm mt-0.5">Gestión de partidos del Mundial 2026</p>
        </div>
        <Button onClick={openNew}><Plus size={16} className="mr-1" />Nuevo partido</Button>
      </div>

      {/* Stage filter */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {STAGES.map((s) => (
          <button key={s} onClick={() => setFilterStage(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${filterStage === s ? 'bg-union-blue text-white' : 'bg-union-navy-light text-white/50 hover:text-white'}`}>
            {getStageName(s)}
          </button>
        ))}
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
                  {match.home_flag} {match.home_team} vs {match.away_team} {match.away_flag}
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
            await upsert.mutateAsync({ ...editMatch, ...data, stage: data.stage as MatchStage })
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
    </Layout>
  )
}

function MatchFormModal({ match, onClose, onSave, loading }: {
  match: Partial<Match>; onClose: () => void; onSave: (d: MatchFormData) => Promise<void>; loading: boolean
}) {
  const isEdit = !!match.id
  const { register, handleSubmit, formState: { errors } } = useForm<MatchFormData>({
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
      status: match.status ?? 'upcoming',
    },
  })

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
