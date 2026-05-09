import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Copy, Check, Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { useCreateTournament } from '../../hooks/useTournaments'
import type { Tournament } from '../../types'

const COMPETITIONS = [
  { value: 'apertura_2026', label: '🇦🇷 Apertura 2026' },
  { value: 'mundial_2026', label: '🌎 Mundial 2026' },
]

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(50),
  competition: z.string().min(1),
  entry_fee: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  club_fee_percentage: z.coerce.number().min(0).max(100),
  pts_exact: z.coerce.number().min(0).max(20),
  pts_outcome: z.coerce.number().min(0).max(20),
  pts_penalty_correct: z.coerce.number().min(0).max(10),
  pts_penalty_wrong_deduct: z.coerce.number().min(0).max(10),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  userId: string
}

export function CreateTournamentModal({ open, onClose, userId }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      entry_fee: 0,
      club_fee_percentage: 10,
      competition: 'apertura_2026',
      pts_exact: 3,
      pts_outcome: 1,
      pts_penalty_correct: 1,
      pts_penalty_wrong_deduct: 1,
    },
  })
  const createTournament = useCreateTournament()
  const [created, setCreated] = useState<Tournament | null>(null)
  const [copied, setCopied] = useState(false)
  const [showRules, setShowRules] = useState(true)

  async function onSubmit(data: FormData) {
    const { pts_exact, pts_outcome, pts_penalty_correct, pts_penalty_wrong_deduct, ...rest } = data
    const t = await createTournament.mutateAsync({
      ...rest,
      created_by: userId,
      rules: { pts_exact, pts_outcome, pts_penalty_correct, pts_penalty_wrong_deduct },
    })
    setCreated(t)
  }

  function handleClose() {
    setCreated(null)
    reset()
    setShowRules(false)
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
          <Input label="Nombre del torneo" placeholder="Ej: Quincho de Juan" error={errors.name?.message} {...register('name')} />
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
          <Input label="Inscripción (ARS)" type="number" min="0" placeholder="0 = gratuito" error={errors.entry_fee?.message} {...register('entry_fee')} />
          <Input label="% para el club" type="number" min="0" max="100" placeholder="10" error={errors.club_fee_percentage?.message} {...register('club_fee_percentage')} />
          <p className="text-xs text-white/40">El resto del pozo va al ganador del torneo.</p>

          {/* Reglas de puntuación */}
          <div className="border border-union-blue/20 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRules((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-union-blue-light hover:bg-union-blue/5 transition-colors"
            >
              <span>Reglas de puntuación</span>
              {showRules ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {showRules && (
              <div className="px-4 pb-4 space-y-3 border-t border-union-blue/10 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Marcador exacto (pts)"
                    type="number" min="0" max="20"
                    error={errors.pts_exact?.message}
                    {...register('pts_exact')}
                  />
                  <Input
                    label="Resultado correcto (pts)"
                    type="number" min="0" max="20"
                    error={errors.pts_outcome?.message}
                    {...register('pts_outcome')}
                  />
                </div>
                <p className="text-[11px] text-white/30">Penales (solo empates en eliminatorias)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Penales acertados (+pts)"
                    type="number" min="0" max="10"
                    error={errors.pts_penalty_correct?.message}
                    {...register('pts_penalty_correct')}
                  />
                  <Input
                    label="Penales errados en exacto (-pts)"
                    type="number" min="0" max="10"
                    error={errors.pts_penalty_wrong_deduct?.message}
                    {...register('pts_penalty_wrong_deduct')}
                  />
                </div>
              </div>
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
