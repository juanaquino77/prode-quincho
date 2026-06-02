import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { AppTour } from '../tour/AppTour'
import { HowToPlayModal } from '../tour/HowToPlayModal'
import { useGlobalTournament, useUserTournaments, useAutoEnrollGlobal } from '../../hooks/useTournaments'
import { useAuthStore } from '../../store/authStore'
import { useHelpStore, hasTourBeenSeen, markTourAsSeen } from '../../store/helpStore'

function GlobalTournamentBanner() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: globalTournament } = useGlobalTournament()
  const { data: myTournaments } = useUserTournaments(user?.id)
  const autoEnroll = useAutoEnrollGlobal()
  const enrollTriggered = useRef(false)

  const globalInMyList = myTournaments?.find((t) => t.type === 'global')

  // Auto-inscribir al torneo global si no está aún
  useEffect(() => {
    if (!user || !globalTournament || !myTournaments) return
    if (enrollTriggered.current || globalInMyList) return
    enrollTriggered.current = true
    autoEnroll.mutate(globalTournament.id)
  }, [user, globalTournament, myTournaments, globalInMyList])

  const needsPayment = globalInMyList && globalInMyList.entry_fee > 0 && globalInMyList.user_paid === false
  if (!needsPayment) return null

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl shrink-0">🎯</span>
          <div className="min-w-0">
            <p className="text-yellow-400 text-xs font-bold leading-tight">
              Todavía no presentaste tu tarjeta del Mundial 2026
            </p>
            <p className="text-white/40 text-xs hidden sm:block">
              Completá tus pronósticos y pagá ${globalInMyList.entry_fee.toLocaleString('es-AR')} ARS para participar en el torneo global
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/predicciones?t=${globalInMyList.id}`)}
          className="shrink-0 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
        >
          Presentar tarjeta →
        </button>
      </div>
    </div>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { openTour } = useHelpStore()

  // Mostrar tour automáticamente la primera vez
  useEffect(() => {
    if (!hasTourBeenSeen()) {
      markTourAsSeen()
      // Pequeño delay para que la app termine de cargar antes de mostrar el tour
      const t = setTimeout(() => openTour(), 600)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-navy">
      <Header />
      <GlobalTournamentBanner />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      <AppTour />
      <HowToPlayModal />
    </div>
  )
}
