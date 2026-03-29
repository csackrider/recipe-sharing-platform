'use server'

import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { likes, savedRecipes } from '@/lib/db/schema'
import { auth } from '@/lib/auth'

type ActionResult = { error: string } | null

export async function likeRecipe(recipeId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'You must be logged in to like a recipe.' }

  try {
    await db.insert(likes).values({ userId: session.user.id, recipeId })
  } catch (err) {
    console.error('[likeRecipe]', err)
    return { error: 'Failed to like recipe.' }
  }

  revalidatePath(`/recipes/${recipeId}`)
  return null
}

export async function unlikeRecipe(recipeId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'You must be logged in.' }

  try {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, session.user.id), eq(likes.recipeId, recipeId)))
  } catch (err) {
    console.error('[unlikeRecipe]', err)
    return { error: 'Failed to unlike recipe.' }
  }

  revalidatePath(`/recipes/${recipeId}`)
  return null
}

export async function saveRecipe(recipeId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'You must be logged in to save a recipe.' }

  try {
    await db.insert(savedRecipes).values({ userId: session.user.id, recipeId })
  } catch (err) {
    console.error('[saveRecipe]', err)
    return { error: 'Failed to save recipe.' }
  }

  revalidatePath(`/recipes/${recipeId}`)
  revalidatePath('/profile/me')
  return null
}

export async function unsaveRecipe(recipeId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'You must be logged in.' }

  try {
    await db
      .delete(savedRecipes)
      .where(and(eq(savedRecipes.userId, session.user.id), eq(savedRecipes.recipeId, recipeId)))
  } catch (err) {
    console.error('[unsaveRecipe]', err)
    return { error: 'Failed to unsave recipe.' }
  }

  revalidatePath(`/recipes/${recipeId}`)
  revalidatePath('/profile/me')
  return null
}
