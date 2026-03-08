import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecipeForm from '@/components/recipes/RecipeForm'

interface EditRecipePageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Edit Recipe | Recipe Share',
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !recipe) notFound()

  // Only the owner can edit
  if (recipe.user_id !== user.id) redirect(`/recipes/${id}`)

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
            defaultValues={{
              title: recipe.title,
              instructions: recipe.instructions,
              cooking_time: recipe.cooking_time,
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
