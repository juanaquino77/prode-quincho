import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Camera, Save, Mail, Calendar, Trophy, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useUpdateProfile, useUploadAvatar } from '../hooks/useProfile'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Layout } from '../components/layout/Layout'

const schema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
  full_name: z.string().min(2, 'Ingresá tu nombre'),
})
type FormData = z.infer<typeof schema>

export default function Profile() {
  const { user, profile } = useAuthStore()
  const [success, setSuccess] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: profile?.username ?? '',
      full_name: profile?.full_name ?? '',
    },
  })

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function onSubmit(data: FormData) {
    setSuccess(false)
    try {
      let avatar_url: string | undefined = undefined

      if (pendingFile) {
        avatar_url = await uploadAvatar.mutateAsync(pendingFile)
        setPendingFile(null)
      }

      await updateProfile.mutateAsync({
        username: data.username,
        full_name: data.full_name,
        ...(avatar_url !== undefined && { avatar_url }),
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      // errors handled below via mutation state
    }
  }

  const currentAvatar = avatarPreview ?? profile?.avatar_url
  const mutationError = updateProfile.error?.message ?? uploadAvatar.error?.message

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-white mb-6">Mi perfil</h1>

        <div className="bg-union-navy-light border border-union-blue/20 rounded-2xl p-6 shadow-2xl space-y-6">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-union-blue/20 border-2 border-union-blue/40 flex items-center justify-center overflow-hidden">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-union-blue" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera size={20} className="text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-union-blue hover:text-union-blue-light transition-colors"
            >
              Cambiar foto
            </button>
            {pendingFile && (
              <p className="text-xs text-white/40">
                {pendingFile.name} — se guardará al hacer clic en Guardar
              </p>
            )}
          </div>

          {/* Read-only info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5 rounded-lg">
              <Mail size={15} className="text-white/30 shrink-0" />
              <span className="text-sm text-white/50">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5 rounded-lg">
              <Calendar size={15} className="text-white/30 shrink-0" />
              <span className="text-sm text-white/50">
                Miembro desde{' '}
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
                  : '—'}
              </span>
            </div>
          </div>

          {/* Editable form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nombre de usuario"
              placeholder="quinchero99"
              icon={<Trophy size={16} />}
              error={errors.username?.message}
              {...register('username')}
            />
            <Input
              label="Nombre completo"
              placeholder="Juan Pérez"
              icon={<User size={16} />}
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            {mutationError && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                {mutationError.includes('23505') ? 'Ese nombre de usuario ya está en uso.' : mutationError}
              </p>
            )}

            {success && (
              <p className="text-sm text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
                ¡Perfil actualizado correctamente!
              </p>
            )}

            <Button
              type="submit"
              loading={isSubmitting || uploadAvatar.isPending || updateProfile.isPending}
              className="w-full"
              size="lg"
            >
              {uploadAvatar.isPending ? (
                <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Subiendo imagen…</span>
              ) : updateProfile.isPending ? (
                <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Guardando…</span>
              ) : (
                <span className="flex items-center gap-2"><Save size={16} />Guardar cambios</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
