import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

interface UpdateProfileData {
  username: string
  full_name: string
  avatar_url?: string | null
}

export function useUpdateProfile() {
  const { user, setProfile } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!user) throw new Error('No autenticado')
      const { data: updated, error } = await supabase
        .from('profiles')
        .update({ username: data.username, full_name: data.full_name, ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }) })
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return updated
    },
    onSuccess: (updated) => {
      setProfile(updated)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useUploadAvatar() {
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('No autenticado')
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      // Remove old avatar first (ignore error if it doesn't exist)
      await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`, `${user.id}/avatar.gif`])

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      // Bust cache with timestamp
      return `${data.publicUrl}?t=${Date.now()}`
    },
  })
}
