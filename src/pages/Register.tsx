import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const schema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
  full_name: z.string().min(2, 'Ingresá tu nombre'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    if (signUpError) { setError(signUpError.message); return }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        username: data.username,
        full_name: data.full_name,
      }, { onConflict: 'id' })
      if (profileError) {
        if (profileError.code === '23505') {
          setError('El nombre de usuario ya está en uso, elegí otro.')
        } else {
          setError('Error al crear el perfil: ' + profileError.message)
        }
        return
      }
    }
    navigate('/dashboard')
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } })
  }

  async function signInWithFacebook() {
    await supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: `${window.location.origin}/dashboard` } })
  }

  return (
    <div className="min-h-screen bg-gradient-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,168,222,0.4)]">
            <Trophy size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Prode Quincho</h1>
          <p className="text-white/50 mt-1">Creá tu cuenta gratis</p>
        </div>

        <div className="bg-union-navy-light border border-union-blue/20 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-5">Registro</h2>

          <div className="space-y-2 mb-5">
            <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Registrarse con Google
            </button>
            <button onClick={signInWithFacebook} className="w-full flex items-center justify-center gap-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Registrarse con Facebook
            </button>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"/></div>
            <div className="relative flex justify-center"><span className="px-3 bg-union-navy-light text-xs text-white/30">o con email</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Nombre de usuario" placeholder="quinchero99" icon={<User size={16} />} error={errors.username?.message} {...register('username')} />
            <Input label="Nombre completo" placeholder="Juan Pérez" error={errors.full_name?.message} {...register('full_name')} />
            <Input label="Email" type="email" placeholder="tu@email.com" icon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
            <Input label="Contraseña" type="password" placeholder="••••••••" icon={<Lock size={16} />} error={errors.password?.message} {...register('password')} />
            <Input label="Confirmar contraseña" type="password" placeholder="••••••••" icon={<Lock size={16} />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">Crear cuenta</Button>
          </form>

          <p className="text-center text-sm text-white/40 mt-5">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-union-blue hover:text-union-blue-light font-medium">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
