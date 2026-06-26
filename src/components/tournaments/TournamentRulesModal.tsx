import { Modal } from '../ui/Modal'
import { DEFAULT_RULES, SPECIAL_PREDICTION_POINTS } from '../../types'
import type { Tournament, TournamentRules } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  tournament: Pick<Tournament, 'name' | 'rules' | 'prediction_lock_hours' | 'show_rival_predictions' | 'has_special_predictions' | 'has_corazonada' | 'pts_corazonada_bonus'>
}

export function TournamentRulesModal({ open, onClose, tournament }: Props) {
  const r: TournamentRules = tournament.rules ?? DEFAULT_RULES
  const bonus = tournament.pts_corazonada_bonus ?? 5

  return (
    <Modal open={open} onClose={onClose} title="Reglas de puntuación">
      <p className="text-xs text-white/40 mb-4">{tournament.name}</p>

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

        {/* Corazonada */}
        {tournament.has_corazonada && (
          <div className="border-t border-amber-500/15 pt-3 mt-3">
            <p className="text-[11px] font-semibold text-amber-400/50 uppercase tracking-wider mb-3">
              💛 Corazonada
            </p>
            <div className="space-y-3">
              <RuleRow
                icon="💛"
                label="1 Corazonada por grupo"
                value={`${bonus} pts total`}
                valueColor="text-amber-400"
                description={`Elegí un partido de cada grupo como tu Corazonada. Si acertás el exacto, vale ${bonus} pts totales (no 3). Si solo acertás el resultado, sumás 1 pt normal.`}
              />
              <RuleRow
                icon="🔒"
                label="Cierre de Corazonada"
                value="1er partido del grupo"
                valueColor="text-white/50"
                description="La Corazonada se puede cambiar hasta que empiece el primer partido de ese grupo. Después queda fija."
              />
              <RuleRow
                icon="⚽"
                label="Condición para el bonus"
                value="Solo exacto"
                valueColor="text-white/50"
                description="El bonus de Corazonada se aplica únicamente si acertás el marcador exacto, no si solo acertás el resultado."
              />
            </div>
          </div>
        )}

        {/* Predicciones especiales */}
        {tournament.has_special_predictions && (
          <div className="border-t border-amber-500/15 pt-3 mt-3">
            <p className="text-[11px] font-semibold text-amber-400/50 uppercase tracking-wider mb-3">
              ⭐ Predicciones Especiales
            </p>
            <RuleRow
              icon="🏆"
              label="Campeón · Goleador · MVP"
              value={`${SPECIAL_PREDICTION_POINTS} pts c/u`}
              valueColor="text-amber-400"
              description={`Elegís antes del torneo quién va a ganar, quién va a ser el goleador y el mejor jugador. ${SPECIAL_PREDICTION_POINTS} puntos por cada acierto. Se cierran al inicio del torneo.`}
            />
          </div>
        )}

        <div className="border-t border-union-blue/10 pt-3 mt-3 space-y-3">
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">
            Configuración del torneo
          </p>
          <RuleRow
            icon="🕐"
            label="Cierre de pronósticos"
            value="15 min antes"
            description="Los pronósticos se cierran 15 minutos antes del inicio de cada partido"
          />
          <RuleRow
            icon={tournament.show_rival_predictions === 'before' ? '👁️' : '🙈'}
            label="Ver pronósticos rivales"
            value={tournament.show_rival_predictions === 'before' ? 'Antes del partido' : 'Al inicio del partido'}
            description={
              tournament.show_rival_predictions === 'before'
                ? 'Podés ver los pronósticos de tus rivales antes de que empiece el partido'
                : 'Los pronósticos de los rivales se revelan cuando el partido empieza, para evitar copias'
            }
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-union-navy p-3 text-xs text-white/40 leading-relaxed">
        <p className="font-semibold text-white/50 mb-1">Ejemplo</p>
        <p>Partido: 1-1. Pronóstico: 1-1 → <span className="text-white/70">{r.pts_exact} pts (exacto)</span></p>
        <p>Partido: 2-1. Pronóstico: 1-0 → <span className="text-white/70">{r.pts_outcome} pt{r.pts_outcome !== 1 ? 's' : ''} (ganó el local)</span></p>
        <p>Partido: 0-0 + penales local. Pronóstico: 0-0 + local → <span className="text-white/70">{r.pts_exact + r.pts_penalty_correct} pts (exacto + penales)</span></p>
      </div>

      {/* Cómo se cargan los pronósticos */}
      <div className="mt-4 rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-3">
        <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider">📅 Cómo se cargan los pronósticos</p>
        <div className="space-y-2 text-xs text-white/60 leading-relaxed">
          <div className="flex gap-2">
            <span className="text-amber-400 shrink-0">1.</span>
            <p><span className="text-white font-medium">Fase de grupos:</span> desde el inicio del Mundial podés cargar tus pronósticos para todos los partidos de grupos, día a día o todos juntos.</p>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 shrink-0">2.</span>
            <p><span className="text-white font-medium">Fase eliminatoria:</span> una vez definidos los 32 clasificados, se habilitan los pronósticos de eliminatorias (Ronda de 32, 8vos, cuartos, semis y final).</p>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 shrink-0">⏰</span>
            <p>Cada pronóstico cierra <span className="text-white font-medium">15 minutos antes</span> del inicio de ese partido. Hasta ese momento podés editar libremente.</p>
          </div>
        </div>
        <div className="border-t border-amber-500/15 pt-3">
          <p className="text-xs text-amber-300/80 font-medium">⚠️ Importante sobre la inscripción</p>
          <p className="text-xs text-white/50 mt-1 leading-relaxed">
            Para participar de los premios debés abonar la entrada <span className="text-white font-medium">antes del inicio del Mundial</span>. Quienes paguen después del comienzo no acceden a la premiación.
          </p>
        </div>
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
