import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Clock, User } from 'lucide-react'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, recipes, savedRecipes } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import EditProfileForm from '@/components/profile/EditProfileForm'
import ChangePasswordForm from '@/components/profile/ChangePasswordForm'

export const metadata: Metadata = {
  title: 'My Profile | Recipe Share',
}

const difficultyStyles = {
  easy: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard: 'bg-red-50 text-red-700',
}

interface MyProfilePageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function MyProfilePage({ searchParams }: MyProfilePageProps) {
  const { tab } = await searchParams
  const activeTab = tab === 'saved' ? 'saved' : 'recipes'

  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  const myRecipes = await db
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
    .where(eq(recipes.userId, session.user.id))
    .orderBy(desc(recipes.createdAt))

  const recipeCount = myRecipes.length

  let savedRecipeRows: typeof myRecipes = []
  if (activeTab === 'saved') {
    savedRecipeRows = await db
      .select({
        id: recipes.id,
        title: recipes.title,
        cookingTime: recipes.cookingTime,
        difficulty: recipes.difficulty,
        category: recipes.category,
        createdAt: recipes.createdAt,
        imageUrl: recipes.imageUrl,
      })
      .from(savedRecipes)
      .innerJoin(recipes, eq(savedRecipes.recipeId, recipes.id))
      .where(eq(savedRecipes.userId, session.user.id))
      .orderBy(desc(savedRecipes.createdAt))
  }

  const tabLinkClass = (active: boolean) =>
    cn(
      'flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors',
      active ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
    )

  const RecipeCard = ({
    id, title, cookingTime, difficulty, category, imageUrl,
  }: {
    id: string; title: string; cookingTime: number
    difficulty: string; category: string | null; imageUrl: string | null
  }) => {
    const diff = difficulty as 'easy' | 'medium' | 'hard'
    return (
      <Link
        href={`/recipes/${id}`}
        className="group flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden"
      >
        {imageUrl ? (
          <div className="relative h-28 w-full">
            <Image src={imageUrl} alt={title} fill className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw" />
          </div>
        ) : (
          <div className="h-20 w-full bg-gradient-to-br from-orange-400 to-red-400" />
        )}
        <div className="p-4">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {category && (
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                {category}
              </span>
            )}
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
              difficultyStyles[diff] ?? 'bg-zinc-100 text-zinc-600')}>
              {diff}
            </span>
          </div>
          <h2 className="mb-2 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-orange-600">
            {title}
          </h2>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            {cookingTime} min
          </span>
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">

          <aside className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <User className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-900">
                    {profile?.displayName ?? profile?.username ?? 'No name set'}
                  </p>
                  <p className="truncate text-xs text-zinc-400">@{profile?.username}</p>
                </div>
              </div>

              {profile?.bio ? (
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

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-zinc-900">Edit profile</h2>
              <EditProfileForm
                defaultValues={{
                  display_name: profile?.displayName ?? '',
                  bio: profile?.bio ?? '',
                }}
              />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-zinc-900">Change password</h2>
              <ChangePasswordForm />
            </div>
          </aside>

          <main>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                <Link href="/profile/me" className={tabLinkClass(activeTab === 'recipes')}>
                  My recipes
                </Link>
                <Link href="/profile/me?tab=saved" className={tabLinkClass(activeTab === 'saved')}>
                  Saved
                </Link>
              </div>
              {activeTab === 'recipes' && (
                <Link
                  href="/recipes/new"
                  className="rounded-full bg-orange-500 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
                >
                  + New recipe
                </Link>
              )}
            </div>

            {activeTab === 'recipes' ? (
              myRecipes.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {myRecipes.map((r) => <RecipeCard key={r.id} {...r} />)}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
                  <p className="mb-1 text-sm font-medium text-zinc-600">No recipes yet</p>
                  <p className="mb-4 text-xs text-zinc-400">Share your first recipe.</p>
                  <Link href="/recipes/new"
                    className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
                    Add a recipe
                  </Link>
                </div>
              )
            ) : (
              savedRecipeRows.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {savedRecipeRows.map((r) => <RecipeCard key={r.id} {...r} />)}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
                  <p className="mb-1 text-sm font-medium text-zinc-600">No saved recipes yet</p>
                  <p className="mb-4 text-xs text-zinc-400">
                    Tap the bookmark on any recipe to save it here.
                  </p>
                  <Link href="/recipes"
                    className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
                    Browse recipes
                  </Link>
                </div>
              )
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
