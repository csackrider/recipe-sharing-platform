'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validations/profile'

export type ProfileActionResult = { error: string } | { success: true } | null

export async function updateProfile(data: unknown): Promise<ProfileActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to update your profile.' }

  const parsed = profileSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.display_name ?? null,
      bio: parsed.data.bio ?? null,
    })
    .eq('id', user.id)

  if (error) {
    console.error('[updateProfile]', error.message)
    return { error: 'Failed to update profile. Please try again.' }
  }

  revalidatePath('/profile/me')
  return { success: true }
}
