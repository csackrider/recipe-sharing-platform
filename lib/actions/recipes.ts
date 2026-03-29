'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { recipes } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { recipeSchema } from '@/lib/validations/recipe'

export type RecipeActionResult = { error: string } | null

export async function createRecipe(
  data: unknown,
  imageUrl?: string
): Promise<RecipeActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'You must be logged in to create a recipe.' }

  const parsed = recipeSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { title, instructions, cooking_time, difficulty, category, ingredients } = parsed.data

  let recipeId: string
  try {
    const [recipe] = await db
      .insert(recipes)
      .values({
        userId: session.user.id,
        title,
        instructions,
        cookingTime: cooking_time,
        difficulty,
        category: category ?? null,
        ingredients,
        imageUrl: imageUrl ?? null,
      })
      .returning({ id: recipes.id })

    recipeId = recipe.id
  } catch (err) {
    console.error('[createRecipe]', err)
    return { error: 'Failed to save recipe. Please try again.' }
  }

  revalidatePath('/recipes')
  redirect(`/recipes/${recipeId}`)
}

export async function updateRecipe(
  id: string,
  data: unknown,
  imageUrl?: string | null
): Promise<RecipeActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'You must be logged in to edit a recipe.' }

  const [existing] = await db
    .select({ userId: recipes.userId })
    .from(recipes)
    .where(eq(recipes.id, id))
    .limit(1)

  if (!existing) return { error: 'Recipe not found.' }
  if (existing.userId !== session.user.id) return { error: 'You can only edit your own recipes.' }

  const parsed = recipeSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { title, instructions, cooking_time, difficulty, category, ingredients } = parsed.data

  const updatePayload: Record<string, unknown> = {
    title,
    instructions,
    cookingTime: cooking_time,
    difficulty,
    category: category ?? null,
    ingredients,
  }
  if (imageUrl !== undefined) updatePayload.imageUrl = imageUrl

  try {
    await db.update(recipes).set(updatePayload).where(eq(recipes.id, id))
  } catch (err) {
    console.error('[updateRecipe]', err)
    return { error: 'Failed to update recipe. Please try again.' }
  }

  revalidatePath(`/recipes/${id}`)
  revalidatePath('/recipes')
  redirect(`/recipes/${id}`)
}

export async function deleteRecipe(id: string): Promise<RecipeActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'You must be logged in to delete a recipe.' }

  const [existing] = await db
    .select({ userId: recipes.userId })
    .from(recipes)
    .where(eq(recipes.id, id))
    .limit(1)

  if (!existing) return { error: 'Recipe not found.' }
  if (existing.userId !== session.user.id) return { error: 'You can only delete your own recipes.' }

  try {
    await db.delete(recipes).where(eq(recipes.id, id))
  } catch (err) {
    console.error('[deleteRecipe]', err)
    return { error: 'Failed to delete recipe. Please try again.' }
  }

  revalidatePath('/recipes')
  redirect('/recipes')
}
