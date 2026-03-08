import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { Clock, ChefHat } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import RecipeFilters from '@/components/recipes/RecipeFilters'

export const metadata: Metadata = {
  title: 'Recipes | Recipe Share',
}

const difficultyStyles = {
  easy: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard: 'bg-red-50 text-red-700',
}

interface RecipeRow {
  id: string
  title: string
  cooking_time: number
  difficulty: string
  category: string | null
  created_at: string
  image_url: string | null
  profiles: { username: string; display_name: string | null } | null
}

interface RecipesPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    difficulty?: string
  }>
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const { q, category, difficulty } = await searchParams
  const supabase = await createClient()

  const baseQuery = supabase
    .from('recipes')
    .select('id, title, cooking_time, difficulty, category, created_at, image_url, profiles(username, display_name)')
    .order('created_at', { ascending: false })
    .range(0, 11)

  const withTitle = q?.trim() ? baseQuery.ilike('title', `%${q.trim()}%`) : baseQuery
  const withCategory = category ? withTitle.eq('category', category) : withTitle
  const withDifficulty = difficulty ? withCategory.eq('difficulty', difficulty) : withCategory

  const { data: recipes, error } = await withDifficulty as unknown as {
    data: RecipeRow[] | null
    error: { message: string } | null
  }

  if (error) {
    console.error('[RecipesPage]', error.message)
  }

  const { data: { user } } = await supabase.auth.getUser()

  const hasFilters = !!(q || category || difficulty)
  const resultCount = recipes?.length ?? 0

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {hasFilters ? 'Search results' : 'All recipes'}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {hasFilters
              ? `${resultCount} recipe${resultCount === 1 ? '' : 's'} found`
              : resultCount > 0
                ? `${resultCount} recipe${resultCount === 1 ? '' : 's'} shared so far`
                : 'No recipes yet — be the first!'}
          </p>
        </div>

        {/* Filters — wrapped in Suspense because useSearchParams needs it */}
        <div className="mb-8">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-zinc-100" />}>
            <RecipeFilters />
          </Suspense>
        </div>

        {/* Grid */}
        {recipes && recipes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => {
              const profile = recipe.profiles as
                | { username: string; display_name: string | null }
                | null
              const author = profile?.display_name ?? profile?.username ?? 'Unknown'
              const diff = recipe.difficulty as 'easy' | 'medium' | 'hard'

              return (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  {recipe.image_url ? (
                    <div className="relative mb-4 h-24 w-full overflow-hidden rounded-lg">
                      <Image
                        src={recipe.image_url}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 h-24 w-full rounded-lg bg-gradient-to-br from-orange-400 to-red-400" />
                  )}

                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {recipe.category && (
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                        {recipe.category}
                      </span>
                    )}
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
                      difficultyStyles[diff] ?? 'bg-zinc-100 text-zinc-600'
                    )}>
                      {diff}
                    </span>
                  </div>

                  <h2 className="mb-3 flex-1 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-orange-600">
                    {recipe.title}
                  </h2>

                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {recipe.cooking_time} min
                    </span>
                    <span className="flex items-center gap-1">
                      <ChefHat className="h-3.5 w-3.5" />
                      {author}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-20 text-center">
            {hasFilters ? (
              <>
                <p className="mb-1 text-sm font-medium text-zinc-600">No recipes match your search</p>
                <p className="mb-4 text-xs text-zinc-400">Try different keywords or clear the filters.</p>
                <Link
                  href="/recipes"
                  className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                >
                  Clear filters
                </Link>
              </>
            ) : (
              <>
                <p className="mb-1 text-sm font-medium text-zinc-600">No recipes yet</p>
                <p className="mb-4 text-xs text-zinc-400">Be the first to share a recipe.</p>
                {user ? (
                  <Link
                    href="/recipes/new"
                    className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    Add a recipe
                  </Link>
                ) : (
                  <Link
                    href="/auth/signup"
                    className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    Sign up to add recipes
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
