import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Clock, ChefHat, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import EditProfileForm from '@/components/profile/EditProfileForm'

export const metadata: Metadata = {
  title: 'My Profile | Recipe Share',
}

const difficultyStyles = {
  easy: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard: 'bg-red-50 text-red-700',
}

export default async function MyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, cooking_time, difficulty, category, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const recipeCount = recipes?.length ?? 0

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">

          {/* Left — profile card */}
          <aside className="space-y-6">
            {/* Avatar + name */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <User className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-900">
                    {profile?.display_name ?? profile?.username ?? 'No name set'}
                  </p>
                  <p className="truncate text-xs text-zinc-400">
                    @{profile?.username}
                  </p>
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

            {/* Edit profile */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-zinc-900">
                Edit profile
              </h2>
              <EditProfileForm
                defaultValues={{
                  display_name: profile?.display_name ?? '',
                  bio: profile?.bio ?? '',
                }}
              />
            </div>
          </aside>

          {/* Right — recipes */}
          <main>
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-zinc-900">My recipes</h1>
              <Link
                href="/recipes/new"
                className="rounded-full bg-orange-500 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
              >
                + New recipe
              </Link>
            </div>

            {recipes && recipes.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {recipes.map((recipe) => {
                  const difficulty = recipe.difficulty as 'easy' | 'medium' | 'hard'
                  return (
                    <Link
                      key={recipe.id}
                      href={`/recipes/${recipe.id}`}
                      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="mb-4 h-20 w-full rounded-lg bg-gradient-to-br from-orange-400 to-red-400" />

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
                          {new Date(recipe.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
                <p className="mb-1 text-sm font-medium text-zinc-600">
                  No recipes yet
                </p>
                <p className="mb-4 text-xs text-zinc-400">
                  Share your first recipe with the community.
                </p>
                <Link
                  href="/recipes/new"
                  className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  Add a recipe
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
