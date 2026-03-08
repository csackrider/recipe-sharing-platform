'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { error: string } | null

export async function likeRecipe(recipeId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to like a recipe.' }

  const { error } = await supabase
    .from('likes')
    .insert({ user_id: user.id, recipe_id: recipeId })

  if (error) {
    console.error('[likeRecipe]', error.message)
    return { error: 'Failed to like recipe.' }
  }

  revalidatePath(`/recipes/${recipeId}`)
  return null
}

export async function unlikeRecipe(recipeId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in.' }

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)

  if (error) {
    console.error('[unlikeRecipe]', error.message)
    return { error: 'Failed to unlike recipe.' }
  }

  revalidatePath(`/recipes/${recipeId}`)
  return null
}

export async function saveRecipe(recipeId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to save a recipe.' }

  const { error } = await supabase
    .from('saved_recipes')
    .insert({ user_id: user.id, recipe_id: recipeId })

  if (error) {
    console.error('[saveRecipe]', error.message)
    return { error: 'Failed to save recipe.' }
  }

  revalidatePath(`/recipes/${recipeId}`)
  revalidatePath('/profile/me')
  return null
}

export async function unsaveRecipe(recipeId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in.' }

  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)

  if (error) {
    console.error('[unsaveRecipe]', error.message)
    return { error: 'Failed to unsave recipe.' }
  }

  revalidatePath(`/recipes/${recipeId}`)
  revalidatePath('/profile/me')
  return null
}
