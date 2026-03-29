import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { recipes } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import RecipeForm from '@/components/recipes/RecipeForm'

interface EditRecipePageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Edit Recipe | Recipe Share',
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, id))
    .limit(1)

  if (!recipe) notFound()
  if (recipe.userId !== session.user.id) redirect(`/recipes/${id}`)

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Edit recipe
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Update the details below and save your changes.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <RecipeForm
            recipeId={id}
            defaultImageUrl={recipe.imageUrl}
            defaultValues={{
              title: recipe.title,
              instructions: recipe.instructions,
              cooking_time: recipe.cookingTime,
              difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard',
              category: recipe.category ?? undefined,
              ingredients: (recipe.ingredients as string[]).length > 0
                ? (recipe.ingredients as string[])
                : [''],
            }}
          />
        </div>
      </div>
    </div>
  )
}
