import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Copy, Check, Trophy, Clock, Eye, EyeOff, Star } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { useCreateTournament } from '../../hooks/useTournaments'
import { useTournamentTypesPublic } from '../../hooks/useTournamentTypes'
import type { Tournament, TournamentTypePublic } from '../../types'

const COMPETITIONS = [
  { value: 'apertura_2026', label: '🇦🇷 Apertura 2026' },
  { value: 'mundial_2026', label: '🌎 Mundial 2026' },
]

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(50),
  competition: z.string().min(1),
  entry_fee: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  tournament_type_id: z.string().uuid('Seleccioná un tipo de torneo'),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  userId: string
}

export function CreateTournamentModal({ open, onClose, userId }: Props) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { entry_fee: 0, competition: 'apertura_2026', tournament_type_id: '' },
  })
  const createTournament = useCreateTournament()
  const { data: types = [], isLoading: typesLoading } = useTournamentTypesPublic()
  const [created, setCreated] = useState<Tournament | null>(null)
  const [copied, setCopied] = useState(false)
  const selectedTypeId = watch('tournament_type_id')

  async function onSubmit(data: FormData) {
    const t = await createTournament.mutateAsync({ ...data, created_by: userId })
    setCreated(t)
  }

  function handleClose() {
    setCreated(null)
    reset()
    onClose()
  }

  function copyCode() {
    if (created?.invite_code) {
      navigator.clipboard.writeText(created.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Crear torneo de amigos">
      {!created ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre del torneo"
            placeholder="Ej: Quincho de Juan"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-union-blue-light">Competencia</label>
            <select
              className="bg-union-navy-light border border-union-blue/20 rounded-lg text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-union-blue"
              {...register('competition')}
            >
              {COMPETITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Inscripción (ARS)"
            type="number"
            min="0"
            placeholder="0 = gratuito"
            error={errors.entry_fee?.message}
            {...register('entry_fee')}
          />

          {/* Selector de tipo de torneo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-union-blue-light">Tipo de torneo</label>
            {typesLoading ? (
              <p className="text-sm text-white/40">Cargando tipos...</p>
            ) : types.length === 0 ? (
              <p className="text-sm text-white/40">No hay tipos disponibles</p>
            ) : (
              <div className="space-y-2">
                {types.map((type) => (
                  <TournamentTypeCard
                    key={type.id}
                    type={type}
                    selected={selectedTypeId === type.id}
                    onSelect={() => setValue('tournament_type_id', type.id)}
                  />
                ))}
              </div>
            )}
            {errors.tournament_type_id && (
              <p className="text-xs text-red-400">{errors.tournament_type_id.message}</p>
            )}
          </div>

          <Button type="submit" loading={createTournament.isPending} className="w-full">
            Crear torneo
          </Button>
          {createTournament.isError && (
            <p className="text-sm text-red-400">{String((createTournament.error as Error).message)}</p>
          )}
        </form>
      ) : (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <Trophy size={28} className="text-green-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">¡Torneo creado!</p>
            <p className="text-white/50 text-sm mt-1">Compartí este código con tus amigos</p>
          </div>
          <Card className="text-center">
            <p className="text-xs text-white/40 mb-1">Código de invitación</p>
            <p className="text-4xl font-bold tracking-widest text-union-blue">{created.invite_code}</p>
          </Card>
          <Button onClick={copyCode} variant="secondary" className="w-full">
            {copied ? <><Check size={16} className="mr-2" />Copiado!</> : <><Copy size={16} className="mr-2" />Copiar código</>}
          </Button>
          <Button onClick={handleClose} className="w-full">Ir al torneo</Button>
        </div>
      )}
    </Modal>
  )
}

function TournamentTypeCard({
  type,
  selected,
  onSelect,
}: {
  type: TournamentTypePublic
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
        selected
          ? 'border-union-blue bg-union-blue/10'
          : 'border-union-blue/20 bg-union-navy-light hover:border-union-blue/40'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-white text-sm">{type.name}</span>
        {selected && <Check size={15} className="text-union-blue" />}
      </div>
      {type.description && (
        <p className="text-xs text-white/50 mb-2">{type.description}</p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <Star size={11} />
          {type.pts_exact}pts exacto · {type.pts_outcome}pt resultado
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          Cierra {type.prediction_lock_hours}h antes
        </span>
        <span className="flex items-center gap-1">
          {type.show_rival_predictions === 'before'
            ? <><Eye size={11} />Ve pronósticos antes</>
            : <><EyeOff size={11} />Pronósticos ocultos</>}
        </span>
      </div>
    </button>
  )
}
