import { useState, useEffect } from 'react'
import { CheckCircle2, Copy } from 'lucide-react'
import { Button } from '../ui/Button'
import { useUserTournamentsWithPredictions, useCopyPredictions } from '../../hooks/usePredictions'

interface Props {
  userId: string
  targetTournamentId: string
}

export function CopyPredictionsSection({ userId, targetTournamentId }: Props) {
  const { data: sources = [], isLoading } = useUserTournamentsWithPredictions(userId, targetTournamentId)
  const copyPredictions = useCopyPredictions()
  const [selectedId, setSelectedId] = useState<string>('')
  const [copiedCount, setCopiedCount] = useState<number | null>(null)

  // Resetear resultado cuando el usuario cambia la fuente
  useEffect(() => { setCopiedCount(null) }, [selectedId])

  if (isLoading) return (
    <div className="rounded-xl border border-union-blue/20 bg-union-navy-light p-4">
      <p className="text-xs text-white/30 animate-pulse">Buscando pronósticos anteriores...</p>
    </div>
  )
  if (!sources.length) return null

  const effectiveSource = selectedId || sources[0].id

  async function handleCopy() {
    const count = await copyPredictions.mutateAsync({
      userId,
      sourceTournamentId: effectiveSource,
      targetTournamentId,
    })
    setCopiedCount(count)
  }

  return (
    <div className="rounded-xl border border-union-blue/20 bg-union-navy-light p-4 space-y-3">
      <p className="text-sm font-semibold text-white">¿Copiar tus predicciones?</p>
      <p className="text-xs text-white/40">
        Podés replicar pronósticos de otro torneo y editarlos según los límites de cada partido.
      </p>

      {sources.length > 1 && (
        <select
          className="w-full bg-union-navy border border-union-blue/20 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-union-blue"
          value={effectiveSource}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.prediction_count} pronósticos)
            </option>
          ))}
        </select>
      )}

      {sources.length === 1 && (
        <p className="text-xs text-white/60">
          Desde: <span className="text-white font-medium">{sources[0].name}</span>{' '}
          <span className="text-white/40">({sources[0].prediction_count} pronósticos)</span>
        </p>
      )}

      {copiedCount !== null ? (
        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
          <CheckCircle2 size={16} />
          {copiedCount === 0
            ? 'No había partidos pendientes para copiar'
            : `${copiedCount} pronóstico${copiedCount !== 1 ? 's' : ''} copiado${copiedCount !== 1 ? 's' : ''}`}
        </div>
      ) : (
        <Button
          variant="secondary"
          className="w-full"
          loading={copyPredictions.isPending}
          onClick={handleCopy}
        >
          <Copy size={14} className="mr-2" />
          Copiar predicciones
        </Button>
      )}

      {copyPredictions.isError && (
        <p className="text-xs text-red-400">{(copyPredictions.error as Error).message}</p>
      )}
    </div>
  )
}
