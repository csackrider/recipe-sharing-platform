'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { profileSchema } from '@/lib/validations/profile'

export type ProfileActionResult = { error: string } | { success: true } | null

export async function updateProfile(data: unknown): Promise<ProfileActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'You must be logged in to update your profile.' }

  const parsed = profileSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  try {
    await db
      .update(users)
      .set({
        displayName: parsed.data.display_name ?? null,
        bio: parsed.data.bio ?? null,
      })
      .where(eq(users.id, session.user.id))
  } catch (err) {
    console.error('[updateProfile]', err)
    return { error: 'Failed to update profile. Please try again.' }
  }

  revalidatePath('/profile/me')
  return { success: true }
}
