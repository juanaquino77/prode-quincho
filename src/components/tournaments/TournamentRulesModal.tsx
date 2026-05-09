import { Modal } from '../ui/Modal'
import { DEFAULT_RULES } from '../../types'
import type { TournamentRules } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  tournamentName: string
  rules?: TournamentRules | null
}

export function TournamentRulesModal({ open, onClose, tournamentName, rules }: Props) {
  const r: TournamentRules = rules ?? DEFAULT_RULES

  return (
    <Modal open={open} onClose={onClose} title="Reglas de puntuación">
      <p className="text-xs text-white/40 mb-4">{tournamentName}</p>

      <div className="space-y-3">
        <RuleRow
          icon="⚽"
          label="Marcador exacto"
          value={`${r.pts_exact} pts`}
          description="Acertás el resultado exacto del partido"
        />
        <RuleRow
          icon="✓"
          label="Resultado correcto"
          value={`${r.pts_outcome} pt${r.pts_outcome !== 1 ? 's' : ''}`}
          description="Acertás quién gana o que es empate, pero no el marcador"
        />

        <div className="border-t border-union-blue/10 pt-3 mt-3">
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">
            Penales — solo empates en eliminatorias
          </p>
          <div className="space-y-3">
            <RuleRow
              icon="🏆"
              label="Ganador de penales acertado"
              value={r.pts_penalty_correct > 0 ? `+${r.pts_penalty_correct} pt${r.pts_penalty_correct !== 1 ? 's' : ''}` : 'Sin bonus'}
              valueColor={r.pts_penalty_correct > 0 ? 'text-green-400' : 'text-white/40'}
              description="Acertás quién gana la definición por penales"
            />
            <RuleRow
              icon="⚠️"
              label="Ganador de penales errado (con exacto)"
              value={r.pts_penalty_wrong_deduct > 0 ? `−${r.pts_penalty_wrong_deduct} pt${r.pts_penalty_wrong_deduct !== 1 ? 's' : ''}` : 'Sin penalidad'}
              valueColor={r.pts_penalty_wrong_deduct > 0 ? 'text-red-400' : 'text-white/40'}
              description="Errás los penales pero habías acertado el marcador exacto"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-union-navy p-3 text-xs text-white/40 leading-relaxed">
        <p className="font-semibold text-white/50 mb-1">Ejemplo</p>
        <p>Partido: 1-1. Pronóstico: 1-1 → <span className="text-white/70">{r.pts_exact} pts (exacto)</span></p>
        <p>Partido: 2-1. Pronóstico: 1-0 → <span className="text-white/70">{r.pts_outcome} pt{r.pts_outcome !== 1 ? 's' : ''} (ganó el local)</span></p>
        <p>Partido: 0-0 + penales local. Pronóstico: 0-0 + local → <span className="text-white/70">{r.pts_exact + r.pts_penalty_correct} pts (exacto + penales)</span></p>
      </div>
    </Modal>
  )
}

function RuleRow({
  icon, label, value, description, valueColor = 'text-union-blue',
}: {
  icon: string
  label: string
  value: string
  description: string
  valueColor?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-union-navy p-3">
      <span className="text-lg leading-none mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-white/40 mt-0.5">{description}</p>
      </div>
      <span className={`text-sm font-bold shrink-0 ${valueColor}`}>{value}</span>
    </div>
  )
}
