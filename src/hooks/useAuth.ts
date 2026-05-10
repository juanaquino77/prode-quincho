import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Profile } from '../types'
import { PENDING_INVITE_KEY } from '../pages/JoinPage'

export function useAuthInit() {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data as Profile | null)
    setLoading(false)
    await handlePendingInvite(userId)
  }

  async function handlePendingInvite(userId: string) {
    const code = localStorage.getItem(PENDING_INVITE_KEY)
    if (!code) return
    localStorage.removeItem(PENDING_INVITE_KEY)

    const { data: tournament } = await supabase
      .from('tournaments')
      .select('id, entry_fee')
      .eq('invite_code', code.toUpperCase())
      .single()

    if (!tournament) return

    await supabase.from('tournament_members').insert({
      tournament_id: tournament.id,
      user_id: userId,
      paid: tournament.entry_fee === 0,
    })
    // ignore duplicate error — already member is fine

    window.location.href = '/torneos'
  }
}

export function useIsAdmin() {
  const profile = useAuthStore((s) => s.profile)
  return profile?.is_admin ?? false
}
