import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const schema = z.object({
  email: z.string().email('Email inválido'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message); return }
    setSent(true)
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
          <h2 className="text-xl font-semibold text-white mb-2">Recuperar contraseña</h2>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-green-400" />
              </div>
              <p className="text-white/80 text-sm">Te mandamos un email con el link para restablecer tu contraseña. Revisá también el spam.</p>
              <Link to="/login" className="mt-4 inline-block text-sm text-union-blue hover:text-union-blue-light font-medium">Volver al login</Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-white/40 mb-5">Ingresá tu email y te mandamos un link para que puedas crear una nueva contraseña.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Email" type="email" placeholder="tu@email.com" icon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
                {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
                <Button type="submit" loading={isSubmitting} className="w-full" size="lg">Enviar link</Button>
              </form>
              <p className="text-center text-sm text-white/40 mt-5">
                <Link to="/login" className="text-union-blue hover:text-union-blue-light font-medium">Volver al login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
