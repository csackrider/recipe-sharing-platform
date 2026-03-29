import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, User } from 'lucide-react'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, recipes } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface PublicProfilePageProps {
  params: Promise<{ username: string }>
}

const difficultyStyles = {
  easy: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard: 'bg-red-50 text-red-700',
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params
  return { title: `${username} | Recipe Share` }
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params

  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

  if (!profile) notFound()

  const userRecipes = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      cookingTime: recipes.cookingTime,
      difficulty: recipes.difficulty,
      category: recipes.category,
      createdAt: recipes.createdAt,
      imageUrl: recipes.imageUrl,
    })
    .from(recipes)
    .where(eq(recipes.userId, profile.id))
    .orderBy(desc(recipes.createdAt))

  const recipeCount = userRecipes.length

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

          <aside>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <User className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-900">
                    {profile.displayName ?? profile.username}
                  </p>
                  <p className="truncate text-xs text-zinc-400">@{profile.username}</p>
                </div>
              </div>

              {profile.bio ? (
                <p className="mb-4 text-sm text-zinc-600">{profile.bio}</p>
              ) : (
                <p className="mb-4 text-sm italic text-zinc-400">No bio yet.</p>
              )}

              <div className="rounded-lg bg-zinc-50 px-4 py-3 text-center">
                <p className="text-2xl font-semibold text-zinc-900">{recipeCount}</p>
                <p className="text-xs text-zinc-500">
                  {recipeCount === 1 ? 'recipe' : 'recipes'} shared
                </p>
              </div>
            </div>
          </aside>

          <main>
            <h1 className="mb-5 text-lg font-semibold text-zinc-900">
              {profile.displayName ?? profile.username}&apos;s recipes
            </h1>

            {userRecipes.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {userRecipes.map((recipe) => {
                  const difficulty = recipe.difficulty as 'easy' | 'medium' | 'hard'
                  return (
                    <Link
                      key={recipe.id}
                      href={`/recipes/${recipe.id}`}
                      className="group flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden"
                    >
                      {recipe.imageUrl ? (
                        <div className="relative h-36 w-full">
                          <Image
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-full bg-gradient-to-br from-orange-400 to-red-400" />
                      )}

                      <div className="p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-1.5">
                          {recipe.category && (
                            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                              {recipe.category}
                            </span>
                          )}
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
                            difficultyStyles[difficulty] ?? 'bg-zinc-100 text-zinc-600'
                          )}>
                            {difficulty}
                          </span>
                        </div>

                        <h2 className="mb-2 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-orange-600">
                          {recipe.title}
                        </h2>

                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="h-3.5 w-3.5" />
                          {recipe.cookingTime} min
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
                <p className="text-sm font-medium text-zinc-600">No recipes shared yet.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
