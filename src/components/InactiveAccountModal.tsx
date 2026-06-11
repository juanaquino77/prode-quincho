import { useGlobalTournament, useMyMembershipStatus } from '../hooks/useTournaments'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

export function InactiveAccountModal() {
  const { user } = useAuthStore()
  const { data: globalTournament } = useGlobalTournament()
  const { data: membership } = useMyMembershipStatus(globalTournament?.id)

  // Solo bloquear si tenemos datos definitivos (not null) y is_active = false
  if (!user || !membership || membership.is_active !== false) return null

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#060e1e]/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-[#0d1f3c] border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-white font-bold text-xl mb-2">Cuenta inactiva</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-4">
          Tu cuenta está marcada como <span className="text-red-400 font-semibold">inactiva</span> en el torneo, ya sea por falta de pago o por no haber registrado actividad.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <p className="text-white/80 text-sm leading-relaxed">
            Si querés volver a participar, contactá a los organizadores. Una vez que abones la entrada y confirmen tu reactivación, vas a poder acceder normalmente.
          </p>
        </div>
        <p className="text-white/30 text-xs mb-6">
          Club Unión Mar del Plata · Prode Quincho
        </p>
        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/60 hover:text-white text-sm font-medium transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
