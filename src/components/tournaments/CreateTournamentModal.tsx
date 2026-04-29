import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Copy, Check, Trophy } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { useCreateTournament } from '../../hooks/useTournaments'
import type { Tournament } from '../../types'

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(50),
  entry_fee: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  club_fee_percentage: z.coerce.number().min(0).max(100),
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
    defaultValues: { entry_fee: 0, club_fee_percentage: 10 },
  })
  const createTournament = useCreateTournament()
  const [created, setCreated] = useState<Tournament | null>(null)
  const [copied, setCopied] = useState(false)

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
          <Input label="Nombre del torneo" placeholder="Ej: Quincho de Juan" error={errors.name?.message} {...register('name')} />
          <Input label="Inscripción (ARS)" type="number" min="0" placeholder="0 = gratuito" error={errors.entry_fee?.message} {...register('entry_fee')} />
          <Input label="% para el club" type="number" min="0" max="100" placeholder="10" error={errors.club_fee_percentage?.message} {...register('club_fee_percentage')} />
          <p className="text-xs text-white/40">El resto del pozo va al ganador del torneo.</p>
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
