import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'

export const PENDING_INVITE_KEY = 'pendingInviteCode'

export default function JoinPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>()
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (loading) return
    if (!inviteCode) { navigate('/torneos'); return }

    if (!user) {
      localStorage.setItem(PENDING_INVITE_KEY, inviteCode.toUpperCase())
      navigate('/login')
      return
    }

    async function doJoin() {
      const { data: tournament, error: tErr } = await supabase
        .from('tournaments')
        .select('id, entry_fee, name')
        .eq('invite_code', inviteCode!.toUpperCase())
        .single()

      if (tErr || !tournament) {
        setErrorMsg('Código inválido o torneo no encontrado.')
        return
      }

      const { error } = await supabase.from('tournament_members').insert({
        tournament_id: tournament.id,
        user_id: user!.id,
        paid: tournament.entry_fee === 0,
      })

      // Si ya es miembro, igual redirigir normalmente
      if (error && !error.code?.includes('23505')) {
        setErrorMsg('Hubo un error al unirse al torneo.')
        return
      }

      navigate('/torneos')
    }

    doJoin()
  }, [user, loading, inviteCode, navigate])

  return (
    <div className="min-h-screen bg-gradient-navy flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,168,222,0.4)]">
          {errorMsg
            ? <Trophy size={36} className="text-white" />
            : <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          }
        </div>
        {errorMsg ? (
          <>
            <p className="text-red-400 mb-4">{errorMsg}</p>
            <Button variant="secondary" onClick={() => navigate('/torneos')}>Ir a torneos</Button>
          </>
        ) : (
          <p className="text-white/60">Uniéndote al torneo...</p>
        )}
      </div>
    </div>
  )
}
