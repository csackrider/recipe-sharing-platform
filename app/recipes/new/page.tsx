import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecipeForm from '@/components/recipes/RecipeForm'

export const metadata: Metadata = {
  title: 'New Recipe | Recipe Share',
}

export default async function NewRecipePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            New recipe
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Fill in the details below to share your recipe.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <RecipeForm />
        </div>
      </div>
    </div>
  )
}
