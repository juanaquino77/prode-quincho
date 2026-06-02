import { useState } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { useHelpStore, markTourAsSeen } from '../../store/helpStore'
import { cn } from '../../lib/utils'

interface Step {
  emoji: string
  title: string
  content?: string[]
  items?: { icon: string; label: string; desc: string }[]
}

const STEPS: Step[] = [
  {
    emoji: '🎉',
    title: '¡Bienvenido al Prode del Club Unión!',
    content: [
      'El pronosticador oficial del Club Unión de Mar del Plata para el Mundial 2026.',
      'Completá tus predicciones partido a partido y competí contra tus amigos y toda la hinchada.',
      'Te mostramos cómo funciona en 3 pasos 👇',
    ],
  },
  {
    emoji: '🧭',
    title: 'El menú de la app',
    items: [
      { icon: '📊', label: 'Inicio',       desc: 'Resumen: partidos próximos, tu posición y el ranking' },
      { icon: '⚽', label: 'Predicciones', desc: 'Cargá tus resultados partido por partido' },
      { icon: '🏆', label: 'Torneos',      desc: 'El torneo global y torneos privados de amigos' },
      { icon: '🔗', label: 'Llave',        desc: 'El cuadro de playoffs (octavos en adelante)' },
      { icon: '👥', label: 'Tabla',        desc: 'El ranking de puntos de todos los jugadores' },
    ],
  },
  {
    emoji: '⚽',
    title: 'Cómo cargar un pronóstico',
    content: [
      'En Predicciones vas a ver todos los partidos del Mundial organizados por grupo y fase.',
      'Para cada partido escribís el marcador que creés que va a salir y guardás.',
      '⏰  Cada partido cierra individualmente: podés modificar tu pronóstico hasta 15 minutos antes de que arranque ESE partido.',
      '📅  Hay 2 fases: Grupos (todos contra todos) y Playoffs (desde octavos hasta la final).',
    ],
  },
  {
    emoji: '💰',
    title: 'Torneos y cómo participar',
    content: [
      '🌍  Torneo Global — competís contra todos los del club. Tiene una entrada de $20.000 ARS que presentás una sola vez.',
      '👫  Torneos de Amigos — una vez inscripto en el global, podés crear o unirte a torneos privados con un código.',
      'Los torneos de amigos pueden ser gratuitos o tener su propia entrada.',
      '¡Todo listo para jugar! 🎯',
    ],
  },
]

export function AppTour() {
  const { tourOpen, closeTour } = useHelpStore()
  const [step, setStep] = useState(0)

  function handleClose() {
    markTourAsSeen()
    closeTour()
    setStep(0)
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  function handlePrev() {
    if (step > 0) setStep(step - 1)
  }

  if (!tourOpen) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-union-navy border border-union-blue/30 rounded-2xl shadow-2xl overflow-hidden">

        {/* Close */}
        <div className="flex justify-between items-center px-5 pt-4 pb-0">
          <span className="text-xs text-white/30 font-medium">
            {step + 1} / {STEPS.length}
          </span>
          <button
            onClick={handleClose}
            className="p-1.5 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pt-3 pb-4 min-h-60">
          <div className="text-5xl mb-3 text-center">{current.emoji}</div>
          <h2 className="text-lg font-bold text-white text-center mb-4 leading-snug">
            {current.title}
          </h2>

          {current.content && (
            <div className="space-y-2.5">
              {current.content.map((line, i) => (
                <p key={i} className="text-white/65 text-sm leading-relaxed">{line}</p>
              ))}
            </div>
          )}

          {current.items && (
            <div className="space-y-1.5">
              {current.items.map((item) => (
                <div key={item.label} className="flex items-center gap-3 bg-union-navy-light rounded-xl px-3 py-2.5">
                  <span className="text-xl shrink-0 w-7 text-center">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-white/45 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          {/* Dots */}
          <div className="flex justify-center gap-2 mb-4">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === step
                    ? 'w-6 h-2 bg-union-blue'
                    : 'w-2 h-2 bg-white/15 hover:bg-white/30'
                )}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={15} />Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-union-blue hover:bg-union-blue-light text-white transition-colors"
            >
              {isLast
                ? '¡Empezar a jugar! 🎯'
                : <><span>Siguiente</span><ChevronRight size={15} /></>
              }
            </button>
          </div>

          {!isLast && (
            <button
              onClick={handleClose}
              className="w-full mt-2 text-xs text-white/20 hover:text-white/40 transition-colors py-1"
            >
              Saltear tour
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
