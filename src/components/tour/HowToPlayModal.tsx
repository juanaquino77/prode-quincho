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
      { accion: '💛 Corazonada: acertás el resultado EXACTO del partido elegido', pts: '5 pts total' },
      { accion: 'Predicciones especiales (campeón, goleador, MVP)',               pts: '+2 pts c/u' },
    ],
    note: 'La Corazonada da 5 pts TOTALES si acertás el marcador exacto (en lugar de los 3 pts normales). Si solo acertás el resultado, sumás 1 pt como siempre.',
  },
  {
    emoji: '💛',
    title: 'Corazonada',
    items: [
      'Fase de grupos: elegís 1 partido de cada grupo como tu Corazonada. Si acertás el marcador exacto, el partido vale 5 pts totales (en lugar de 3).',
      'Eliminatorias: en 16avos y cuartos de final también podés elegir 1 Corazonada por fase. Las semis y la final no tienen Corazonada.',
      'En partidos de eliminatorias que terminan en empate: si acertás el exacto del empate, los penales suman o restan 1 pt como cualquier otro resultado exacto de empate.',
      'La Corazonada no da bonus si solo acertás el ganador sin el marcador exacto.',
    ],
  },
  {
    emoji: '📅',
    title: 'Cómo se cargan los pronósticos — MUY IMPORTANTE',
    highlight: true,
    items: [
      '📌 FASE DE GRUPOS: cuando comience el Mundial podrás cargar tus pronósticos para todos los partidos de la fase de grupos. Podés hacerlo día a día o todos juntos, a tu ritmo.',
      '📌 FASE ELIMINATORIA: una vez definidos los 32 clasificados (al finalizar la fase de grupos), se habilitará la carga de pronósticos para todos los partidos de eliminatorias: 16avos, cuartos, semis y final.',
      '⚠️ Los pronósticos de cada partido cierran 15 minutos antes de que ese partido empiece. Pasado ese tiempo, ese pronóstico ya no se puede modificar.',
      '✅ Mientras un partido no haya empezado, podés editar tu pronóstico todas las veces que quieras.',
    ],
  },
  {
    emoji: '💳',
    title: 'Inscripción y pago',
    items: [
      '⚠️ Para participar de los premios, debés abonar la entrada al Torneo General ANTES del comienzo del Mundial.',
      'Quienes no abonen antes del inicio no podrán participar de la premiación, aunque sí podrán seguir cargando pronósticos.',
      'Torneo Global: la entrada son $20.000 ARS. Se paga por Mercado Pago o por transferencia al club.',
      'Torneos de Amigos: privados, con código de invitación. Gratuitos o con entrada propia.',
      'Para unirte a un torneo de amigos necesitás estar inscripto en el Torneo General primero.',
    ],
  },
  {
    emoji: '🏅',
    title: 'Premios',
    items: [
      '— AL FINALIZAR LA FASE DE GRUPOS —',
      '🥇 1er puesto: premio económico (porcentaje de la recaudación)',
      '— AL FINALIZAR EL MUNDIAL —',
      '🥇 1er puesto: premio económico (porcentaje de la recaudación)',
      '🥈 2do puesto: premio económico (porcentaje de la recaudación)',
      '🥉 3er puesto: premio económico (porcentaje de la recaudación)',
      '⚠️ Cuanto más somos, más crece el pozo. Los premios se calculan sobre la recaudación total.',
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
          <h2 className="text-base font-bold text-white">📖 Reglas</h2>
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
            <div key={sec.title} className={`space-y-2 ${'highlight' in sec && sec.highlight ? 'bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 -mx-1' : ''}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${'highlight' in sec && sec.highlight ? 'text-amber-300' : 'text-white'}`}>
                <span>{sec.emoji}</span>
                {sec.title}
              </h3>

              {sec.items && (
                <ul className="space-y-2 pl-1">
                  {sec.items.map((item, i) => (
                    <li key={i} className="text-xs text-white/65 leading-relaxed">
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
