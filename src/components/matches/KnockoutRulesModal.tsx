import { X } from 'lucide-react'

interface Props {
  onAck: () => void
  onDismiss: () => void
}

const ROWS = [
  { caso: 'Victoria en 90\' o en 90\' + tiempo suplementario — ganador acertado', pts: '+1 pt' },
  { caso: 'Victoria en 90\' o en 90\' + tiempo suplementario — marcador exacto', pts: '+3 pts' },
  { caso: 'Empate exacto + acertás quién gana en penales', pts: '4 pts' },
  { caso: 'Empate exacto + errás quién gana en penales', pts: '2 pts' },
  { caso: 'Empate (no exacto) + acertás quién gana en penales', pts: '2 pts' },
  { caso: 'Empate (no exacto) + errás quién gana en penales', pts: '1 pt' },
  { caso: '💛 Corazonada + marcador exacto (ignora penales)', pts: '5 pts' },
]

export function KnockoutRulesModal({ onAck, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-union-navy border border-union-blue/30 rounded-t-2xl sm:rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-union-blue/15">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>⚔️</span> Puntuación — Fase eliminatoria
          </h2>
          <button onClick={onDismiss} className="p-1.5 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <p className="text-[11px] text-white/50 leading-relaxed">
            El resultado final es el marcador al término de los 90' + tiempo suplementario.
          </p>

          <div className="rounded-xl overflow-hidden border border-union-blue/15 text-xs">
            {ROWS.map((row, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-2.5 gap-3 ${i % 2 === 0 ? 'bg-union-navy-light' : 'bg-union-navy'}`}
              >
                <span className="text-white/55 leading-snug">{row.caso}</span>
                <span className="font-bold shrink-0 text-union-blue">{row.pts}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-white/35 italic">
            Si pronosticás empate siempre se te pedirá el ganador en penales. Si no acertás el empate, el pronóstico de penales no cuenta.
          </p>
        </div>

        {/* Buttons */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white/50 bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            Después lo leo
          </button>
          <button
            onClick={onAck}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-union-blue hover:bg-union-blue/80 transition-colors"
          >
            Entendido ✓
          </button>
        </div>
      </div>
    </div>
  )
}
