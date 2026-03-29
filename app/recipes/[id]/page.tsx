import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, ChefHat, Tag, Pencil } from 'lucide-react'
import { eq, and, count as sqlCount } from 'drizzle-orm'
import { db } from '@/lib/db'
import { recipes, users, likes, savedRecipes } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import DeleteRecipeButton from '@/components/recipes/DeleteRecipeButton'
import LikeButton from '@/components/recipes/LikeButton'
import SaveButton from '@/components/recipes/SaveButton'

interface RecipePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { id } = await params
  const [recipe] = await db.select({ title: recipes.title }).from(recipes).where(eq(recipes.id, id)).limit(1)
  return { title: recipe ? `${recipe.title} | Recipe Share` : 'Recipe | Recipe Share' }
}

const difficultyStyles = {
  easy: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard: 'bg-red-50 text-red-700',
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id

  const [recipeRow] = await db
    .select({
      id: recipes.id,
      userId: recipes.userId,
      title: recipes.title,
      ingredients: recipes.ingredients,
      instructions: recipes.instructions,
      cookingTime: recipes.cookingTime,
      difficulty: recipes.difficulty,
      category: recipes.category,
      imageUrl: recipes.imageUrl,
      createdAt: recipes.createdAt,
      authorUsername: users.username,
      authorDisplayName: users.displayName,
    })
    .from(recipes)
    .leftJoin(users, eq(recipes.userId, users.id))
    .where(eq(recipes.id, id))
    .limit(1)

  if (!recipeRow) notFound()

  const [likeCountResult] = await db
    .select({ value: sqlCount() })
    .from(likes)
    .where(eq(likes.recipeId, id))

  const likeCount = likeCountResult?.value ?? 0

  let userLiked = false
  let userSaved = false

  if (userId) {
    const [likeRow] = await db
      .select({ id: likes.id })
      .from(likes)
      .where(and(eq(likes.recipeId, id), eq(likes.userId, userId)))
      .limit(1)
    userLiked = !!likeRow

    const [saveRow] = await db
      .select({ id: savedRecipes.id })
      .from(savedRecipes)
      .where(and(eq(savedRecipes.recipeId, id), eq(savedRecipes.userId, userId)))
      .limit(1)
    userSaved = !!saveRow
  }

  const isOwner = userId === recipeRow.userId
  const author = recipeRow.authorDisplayName ?? recipeRow.authorUsername ?? 'Unknown'
  const authorUsername = recipeRow.authorUsername
  const difficulty = recipeRow.difficulty as 'easy' | 'medium' | 'hard'

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <article className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          {recipeRow.imageUrl && (
            <div className="relative h-64 w-full">
              <Image
                src={recipeRow.imageUrl}
                alt={recipeRow.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 672px) 100vw, 672px"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <header className="mb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {recipeRow.category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                    <Tag className="h-3 w-3" />
                    {recipeRow.category}
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
                  {recipeRow.title}
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
                  {recipeRow.cookingTime} min
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
                  {new Date(recipeRow.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <LikeButton
                  recipeId={id}
                  initialLiked={userLiked}
                  initialCount={Number(likeCount)}
                  userId={userId}
                />
                <SaveButton
                  recipeId={id}
                  initialSaved={userSaved}
                  userId={userId}
                />
              </div>
            </header>

            <hr className="mb-6 border-zinc-100" />

            <section className="mb-8">
              <h2 className="mb-3 text-base font-semibold text-zinc-900">Ingredients</h2>
              <ul className="space-y-2">
                {(recipeRow.ingredients as string[]).map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-base font-semibold text-zinc-900">Instructions</h2>
              <div className="space-y-3">
                {recipeRow.instructions.split('\n').filter(Boolean).map((step, i) => (
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
