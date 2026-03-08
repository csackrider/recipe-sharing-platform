'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { recipeSchema } from '@/lib/validations/recipe'

export type RecipeActionResult = { error: string } | null

export async function createRecipe(data: unknown): Promise<RecipeActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to create a recipe.' }

  const parsed = recipeSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { title, instructions, cooking_time, difficulty, category, ingredients } = parsed.data

  const { data: recipe, error } = await supabase
    .from('recipes')
    .insert({ user_id: user.id, title, instructions, cooking_time, difficulty, category: category ?? null, ingredients })
    .select('id')
    .single()

  if (error) {
    console.error('[createRecipe]', error.message)
    return { error: 'Failed to save recipe. Please try again.' }
  }

  revalidatePath('/recipes')
  redirect(`/recipes/${recipe.id}`)
}

export async function updateRecipe(
  id: string,
  data: unknown
): Promise<RecipeActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to edit a recipe.' }

  // Verify ownership before updating
  const { data: existing, error: fetchError } = await supabase
    .from('recipes')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || !existing) return { error: 'Recipe not found.' }
  if (existing.user_id !== user.id) return { error: 'You can only edit your own recipes.' }

  const parsed = recipeSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { title, instructions, cooking_time, difficulty, category, ingredients } = parsed.data

  const { error } = await supabase
    .from('recipes')
    .update({ title, instructions, cooking_time, difficulty, category: category ?? null, ingredients })
    .eq('id', id)

  if (error) {
    console.error('[updateRecipe]', error.message)
    return { error: 'Failed to update recipe. Please try again.' }
  }

  revalidatePath(`/recipes/${id}`)
  revalidatePath('/recipes')
  redirect(`/recipes/${id}`)
}

export async function deleteRecipe(id: string): Promise<RecipeActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to delete a recipe.' }

  // Verify ownership before deleting
  const { data: existing, error: fetchError } = await supabase
    .from('recipes')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || !existing) return { error: 'Recipe not found.' }
  if (existing.user_id !== user.id) return { error: 'You can only delete your own recipes.' }

  const { error } = await supabase.from('recipes').delete().eq('id', id)

  if (error) {
    console.error('[deleteRecipe]', error.message)
    return { error: 'Failed to delete recipe. Please try again.' }
  }

  revalidatePath('/recipes')
  redirect('/recipes')
}
