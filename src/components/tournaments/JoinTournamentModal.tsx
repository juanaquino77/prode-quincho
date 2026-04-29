import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useJoinTournament } from '../../hooks/useTournaments'
import type { Tournament } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  userId: string
}

export function JoinTournamentModal({ open, onClose, userId }: Props) {
  const [code, setCode] = useState('')
  const [joined, setJoined] = useState<Tournament | null>(null)
  const joinTournament = useJoinTournament()

  async function handleJoin() {
    if (!code.trim()) return
    const t = await joinTournament.mutateAsync({ userId, inviteCode: code.trim() })
    setJoined(t)
  }

  function handleClose() {
    setCode('')
    setJoined(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Unirse a un torneo">
      {!joined ? (
        <div className="space-y-4">
          <Input
            label="Código de invitación"
            placeholder="Ej: AB12CD"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="text-center text-xl tracking-widest font-bold uppercase"
          />
          <Button onClick={handleJoin} loading={joinTournament.isPending} className="w-full" disabled={!code.trim()}>
            Unirse
          </Button>
          {joinTournament.isError && (
            <p className="text-sm text-red-400">{(joinTournament.error as Error).message}</p>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-green-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">¡Te uniste!</p>
            <p className="text-union-blue mt-1 font-medium">{joined.name}</p>
            {joined.entry_fee > 0 && (
              <p className="text-yellow-400 text-sm mt-2">Inscripción: ${joined.entry_fee} ARS</p>
            )}
          </div>
          <Button onClick={handleClose} className="w-full">Ir al torneo</Button>
        </div>
      )}
    </Modal>
  )
}
