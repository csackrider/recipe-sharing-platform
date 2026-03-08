import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, ChefHat, Tag, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import DeleteRecipeButton from '@/components/recipes/DeleteRecipeButton'
import LikeButton from '@/components/recipes/LikeButton'
import SaveButton from '@/components/recipes/SaveButton'

interface RecipePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('recipes').select('title').eq('id', id).single()
  return { title: data ? `${data.title} | Recipe Share` : 'Recipe | Recipe Share' }
}

const difficultyStyles = {
  easy: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard: 'bg-red-50 text-red-700',
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*, profiles(username, display_name)')
    .eq('id', id)
    .single()

  if (error || !recipe) notFound()

  // Fetch like count and user interaction state in parallel
  const [likeCountResult, userLikeResult, userSaveResult] = await Promise.all([
    supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('recipe_id', id),
    user
      ? supabase.from('likes').select('id').eq('recipe_id', id).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from('saved_recipes').select('id').eq('recipe_id', id).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const likeCount = likeCountResult.count ?? 0
  const userLiked = !!userLikeResult.data
  const userSaved = !!userSaveResult.data

  const isOwner = user?.id === recipe.user_id

  const profileData = recipe.profiles as { username: string; display_name: string | null } | null
  const author = profileData?.display_name ?? profileData?.username ?? 'Unknown'
  const authorUsername = profileData?.username
  const difficulty = recipe.difficulty as 'easy' | 'medium' | 'hard'

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <article className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          {/* Hero image */}
          {recipe.image_url && (
            <div className="relative h-64 w-full">
              <Image
                src={recipe.image_url}
                alt={recipe.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 672px) 100vw, 672px"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Header */}
            <header className="mb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {recipe.category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                    <Tag className="h-3 w-3" />
                    {recipe.category}
                  </span>
                )}
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                    difficultyStyles[difficulty] ?? 'bg-zinc-100 text-zinc-600'
                  )}
                >
                  {difficulty}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                  {recipe.title}
                </h1>
                {isOwner && (
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/recipes/${id}/edit`}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <DeleteRecipeButton recipeId={id} />
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {recipe.cooking_time} min
                </span>
                <span className="flex items-center gap-1.5">
                  <ChefHat className="h-4 w-4" />
                  {authorUsername ? (
                    <Link href={`/profile/${authorUsername}`} className="hover:text-zinc-800 hover:underline">
                      {author}
                    </Link>
                  ) : (
                    author
                  )}
                </span>
                <span>
                  {new Date(recipe.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Like / Save */}
              <div className="mt-4 flex items-center gap-2">
                <LikeButton
                  recipeId={id}
                  initialLiked={userLiked}
                  initialCount={likeCount}
                  userId={user?.id}
                />
                <SaveButton
                  recipeId={id}
                  initialSaved={userSaved}
                  userId={user?.id}
                />
              </div>
            </header>

            <hr className="mb-6 border-zinc-100" />

            {/* Ingredients */}
            <section className="mb-8">
              <h2 className="mb-3 text-base font-semibold text-zinc-900">Ingredients</h2>
              <ul className="space-y-2">
                {(recipe.ingredients as string[]).map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </section>

            {/* Instructions */}
            <section>
              <h2 className="mb-3 text-base font-semibold text-zinc-900">Instructions</h2>
              <div className="space-y-3">
                {recipe.instructions.split('\n').filter(Boolean).map((step, i) => (
                  <p key={i} className="text-sm leading-relaxed text-zinc-700">{step}</p>
                ))}
              </div>
            </section>
          </div>
        </article>
      </div>
    </div>
  )
}
