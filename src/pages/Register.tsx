import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Trophy, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const schema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
  full_name: z.string().min(2, 'Ingresá tu nombre'),
  email: z.string().email('Email inválido'),
  confirmEmail: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
  phone_area: z.string().regex(/^\d{2,4}$/, 'Código de área inválido'),
  phone_number: z.string().regex(/^\d{6,8}$/, 'Número inválido'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden', path: ['confirmPassword'],
}).refine((d) => d.email === d.confirmEmail, {
  message: 'Los emails no coinciden', path: ['confirmEmail'],
})

type FormData = z.infer<typeof schema>

const DUPLICATE_EMAIL_ERRORS = ['User already registered', 'user_already_exists', 'already registered']

export default function Register() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          full_name: data.full_name,
          phone: `${data.phone_area}${data.phone_number}`,
        },
      },
    })
    if (signUpError) {
      const isDuplicate = DUPLICATE_EMAIL_ERRORS.some(e => signUpError.message.includes(e))
      if (isDuplicate) {
        setError('Este email ya está registrado. ¿Querés iniciar sesión?')
      } else {
        setError(signUpError.message)
      }
      return
    }
    navigate('/dashboard')
  }

  async function signInWithGoogle() {
    const pendingCode = localStorage.getItem('pendingInviteCode')
    const redirectTo = pendingCode
      ? `${window.location.origin}/unirse/${pendingCode}`
      : `${window.location.origin}/dashboard`
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
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

          <div className="mb-5">
            <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Registrarse con Google
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
            <Input label="Confirmar email" type="email" placeholder="tu@email.com" icon={<Mail size={16} />} error={errors.confirmEmail?.message} {...register('confirmEmail')} />
            <Input label="Contraseña" type="password" placeholder="••••••••" icon={<Lock size={16} />} error={errors.password?.message} {...register('password')} />
            <Input label="Confirmar contraseña" type="password" placeholder="••••••••" icon={<Lock size={16} />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            <div>
              <label className="text-sm font-medium text-union-blue-light block mb-1">Teléfono <span className="text-white/30 font-normal">(para avisos por WhatsApp)</span></label>
              <p className="text-xs text-white/30 mb-2">Sin el 0 ni el 15. Ej: área <strong className="text-white/50">11</strong> · número <strong className="text-white/50">45678901</strong></p>
              <div className="flex gap-2">
                <div className="w-28">
                  <Input placeholder="Área" icon={<Phone size={16} />} error={errors.phone_area?.message} {...register('phone_area')} inputMode="numeric" />
                </div>
                <div className="flex-1">
                  <Input placeholder="Número" error={errors.phone_number?.message} {...register('phone_number')} inputMode="numeric" />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                {error}{' '}
                {error.includes('ya está registrado') && (
                  <Link to="/login" className="underline font-medium">Ir al login</Link>
                )}
              </p>
            )}
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
