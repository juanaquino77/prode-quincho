import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const schema = z.object({
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden', path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function ResetPassword() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  // false = esperando sesión, true = listo, null = link inválido/expirado
  const [sessionReady, setSessionReady] = useState<boolean | null>(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    // Supabase pone ?error=... en la URL cuando el link realmente expiró o ya fue usado
    const params = new URLSearchParams(window.location.search)
    if (params.get('error')) {
      setSessionReady(null)
      return
    }

    // Verificamos si ya hay sesión activa (e.g. el token se procesó antes del mount)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function onSubmit(data: FormData) {
    setError('')
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) { setError(error.message); return }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,168,222,0.4)]">
            <Trophy size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Prode Quincho</h1>
          <p className="text-white/50 mt-1">Mundial 2026 · El Quincho</p>
        </div>

        <div className="bg-union-navy-light border border-union-blue/20 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-2">Nueva contraseña</h2>

          {sessionReady === false ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-8 h-8 border-2 border-union-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-white/40">Verificando el link...</p>
            </div>
          ) : sessionReady === null ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-400 mb-4">El link expiró o ya fue usado. Pedí uno nuevo.</p>
              <a href="/forgot-password" className="text-sm text-union-blue hover:text-union-blue-light font-medium">Recuperar contraseña</a>
            </div>
          ) : (
            <>
              <p className="text-sm text-white/40 mb-5">Elegí tu nueva contraseña.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Nueva contraseña" type="password" placeholder="••••••••" icon={<Lock size={16} />} error={errors.password?.message} {...register('password')} />
                <Input label="Confirmar contraseña" type="password" placeholder="••••••••" icon={<Lock size={16} />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
                <Button type="submit" loading={isSubmitting} className="w-full" size="lg">Guardar contraseña</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
