import { X } from 'lucide-react'
import { useHelpStore } from '../../store/helpStore'

const SECTIONS = [
  {
    emoji: '🌍',
    title: 'El Mundial 2026',
    items: [
      '48 selecciones compiten en USA, México y Canadá.',
      'Fase de grupos: 12 grupos de 4 equipos. Los 2 primeros de cada grupo clasifican directamente (24 equipos en total).',
      'Los 8 mejores terceros puestos entre los 12 grupos también clasifican.',
      'Round of 32: 32 equipos en eliminación directa, desde octavos de final hasta la gran final.',
    ],
  },
  {
    emoji: '🎯',
    title: 'Sistema de puntos',
    table: [
      { accion: 'Resultado exacto (ej: predijiste 2-1 y salió 2-1)',            pts: '+3 pts' },
      { accion: 'Ganador/empate acertado sin resultado exacto (ej: predijiste 2-0, salió 1-0)', pts: '+1 pt' },
      { accion: 'Penales: acertás el ganador en penales',                        pts: '+1 pt' },
      { accion: 'Penales: errás el ganador (habiendo acertado el empate exacto)', pts: '−1 pt' },
      { accion: '💛 Corazonada: acertás el resultado EXACTO del partido elegido', pts: '+5 pts' },
      { accion: 'Predicciones especiales (campeón, goleador, MVP)',               pts: '+2 pts c/u' },
    ],
    note: 'La Corazonada solo suma los 5 pts extra si acertás el marcador exacto. Si no acertás el exacto, no suma bonus (sí suma el punto normal de resultado si ganador/empate coincide).',
  },
  {
    emoji: '💛',
    title: 'Corazonada',
    items: [
      'Fase de grupos: elegís 1 partido de cada grupo como tu Corazonada. Si acertás el marcador exacto, sumás +5 pts extra.',
      'Eliminatorias: cada fase (16avos, 8vos/cuartos, semis y final) tiene su propia Corazonada — elegís 1 partido por fase.',
      'En partidos de eliminatorias que terminan en empate: si acertás el exacto del empate, los penales suman o restan 1 pt como cualquier otro resultado exacto de empate.',
      'La Corazonada no da bonus si solo acertás el ganador sin el marcador exacto.',
    ],
  },
  {
    emoji: '⏰',
    title: 'Cierre de pronósticos',
    items: [
      'Cada pronóstico cierra de forma individual: 15 minutos antes de que arranque ese partido específico.',
      'Una vez cerrado ese partido, no podés modificar ese pronóstico.',
      'Mientras tanto, podés seguir cargando o editando los pronósticos de los demás partidos que estén a más de 15 minutos de comenzar.',
    ],
  },
  {
    emoji: '💳',
    title: 'Torneos y pago',
    items: [
      'Torneo Global: competís contra todos. La entrada son $20.000 ARS, se paga una sola vez vía Mercado Pago.',
      'Torneos de Amigos: privados, con código de invitación. Podés crear uno o unirte al de un amigo.',
      'Para unirte a torneos de amigos necesitás estar inscripto en el torneo global primero.',
      'Los torneos de amigos pueden ser gratuitos o tener su propia entrada. El club recibe un 10% de los torneos pagos.',
    ],
  },
  {
    emoji: '🏅',
    title: 'Premios',
    items: [
      '— AL FINALIZAR LA FASE DE GRUPOS —',
      '🥇 1er puesto: $200.000 ARS (mínimo)',
      '🥈 2do puesto: indumentaria del club',
      '🥉 3er puesto: indumentaria del club',
      '— AL FINALIZAR EL MUNDIAL —',
      '🥇 1er puesto: $500.000 ARS (mínimo)',
      '🥈 2do puesto: $200.000 ARS (mínimo)',
      '🥉 3er puesto: $100.000 ARS (mínimo)',
      '⚠️ Los montos son mínimos garantizados. Si la recaudación supera lo esperado, los premios suben proporcionalmente.',
    ],
  },
  {
    emoji: '📱',
    title: 'El menú de la app',
    items: [
      '📊 Inicio — partidos próximos, tu posición actual y el top 3 del ranking.',
      '⚽ Predicciones — cargá y editá tus pronósticos partido por partido.',
      '🏆 Torneos — gestioná tu inscripción y creá grupos de amigos.',
      '🔗 Llave — el cuadro de playoffs cuando empiecen las eliminatorias.',
      '👥 Tabla — el ranking completo con puntos de todos los jugadores.',
    ],
  },
]

export function HowToPlayModal() {
  const { howToPlayOpen, closeHowToPlay } = useHelpStore()

  if (!howToPlayOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-union-navy border border-union-blue/30 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header sticky */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-union-blue/15 shrink-0">
          <h2 className="text-base font-bold text-white">📖 Cómo jugar</h2>
          <button
            onClick={closeHowToPlay}
            className="p-1.5 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 py-4 space-y-6">
          {SECTIONS.map((sec) => (
            <div key={sec.title} className="space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{sec.emoji}</span>
                {sec.title}
              </h3>

              {sec.items && (
                <ul className="space-y-1.5 pl-1">
                  {sec.items.map((item, i) => (
                    <li key={i} className="text-xs text-white/60 leading-relaxed flex gap-2">
                      <span className="text-union-blue/50 shrink-0 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {sec.table && (
                <>
                  <div className="rounded-xl overflow-hidden border border-union-blue/15 text-xs">
                    {sec.table.map((row, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-3 py-2.5 gap-3 ${i % 2 === 0 ? 'bg-union-navy-light' : 'bg-union-navy'}`}
                      >
                        <span className="text-white/55 leading-snug">{row.accion}</span>
                        <span className={`font-bold shrink-0 ${row.pts.startsWith('−') ? 'text-red-400' : 'text-union-blue'}`}>
                          {row.pts}
                        </span>
                      </div>
                    ))}
                  </div>
                  {sec.note && (
                    <p className="text-[11px] text-white/30 italic pl-1">{sec.note}</p>
                  )}
                </>
              )}
            </div>
          ))}

          <p className="text-[11px] text-white/20 text-center pb-2">
            ¿Dudas? Hablá con el administrador del club.
          </p>
        </div>
      </div>
    </div>
  )
}
