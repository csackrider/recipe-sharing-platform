'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, auth } from '@/lib/auth'
import { loginSchema, signupSchema, changePasswordSchema } from '@/lib/validations/auth'

export async function signIn(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  try {
    await nextAuthSignIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch {
    return { error: 'Invalid email or password. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUp(
  _prevState: { error: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error: string; success?: boolean } | null> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1)

  if (existing.length > 0) {
    return { error: 'An account with this email already exists.' }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  const username = parsed.data.email.split('@')[0] + '-' + crypto.randomUUID().slice(0, 6)

  try {
    await db.insert(users).values({
      email: parsed.data.email,
      passwordHash,
      username,
    })
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }

  try {
    await nextAuthSignIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch {
    return { error: '', success: true }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut(): Promise<void> {
  await nextAuthSignOut({ redirect: false })
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function changePassword(
  data: unknown
): Promise<{ error: string } | { success: true }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'You must be logged in.' }

  const parsed = changePasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  try {
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, session.user.id))
  } catch {
    return { error: 'Failed to update password. Please try again.' }
  }

  return { success: true }
}
