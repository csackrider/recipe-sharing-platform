import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recipe Share — Share your favorite recipes',
}

interface FeaturedRecipe {
  id: number
  title: string
  description: string
  badge: string
  time: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

const featuredRecipes: FeaturedRecipe[] = [
  {
    id: 1,
    title: 'One-Pot Creamy Tomato Pasta',
    description: 'A cozy weeknight dinner ready in under 30 minutes.',
    badge: 'Quick & Easy',
    time: '25 min',
    difficulty: 'Easy',
  },
  {
    id: 2,
    title: 'Garlic Butter Salmon Bowls',
    description: 'Flaky salmon with herbed rice and roasted veggies.',
    badge: 'Dinner',
    time: '35 min',
    difficulty: 'Medium',
  },
  {
    id: 3,
    title: 'Overnight Berry Chia Pudding',
    description: 'Prep-ahead breakfasts that actually taste amazing.',
    badge: 'Breakfast',
    time: '10 min · prep',
    difficulty: 'Easy',
  },
]

export default function Home() {
  return (
    <div className="bg-zinc-50">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid flex-1 gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-center">
          <section>
            <p className="mb-3 inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
              New · Share recipes with friends
            </p>
            <h1 className="mb-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Your favorite recipes,{' '}
              <span className="text-orange-600">all in one place.</span>
            </h1>
            <p className="mb-6 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              Upload recipes, keep track of your go‑to meals, and discover new
              ideas from home cooks just like you. Simple, fast, and built for
              everyday cooking.
            </p>
            <div className="mb-6 flex flex-wrap gap-3 text-sm">
              <Link
                href="/recipes"
                className="rounded-full bg-zinc-900 px-4 py-2 font-medium text-white shadow-sm hover:bg-zinc-800"
              >
                Browse recipes
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full border border-zinc-200 px-4 py-2 text-zinc-700 hover:border-zinc-300 hover:bg-white"
              >
                Add your first recipe
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
              <span>✓ Save and organize your own recipes</span>
              <span>✓ Simple ingredient lists &amp; steps</span>
              <span>✓ Built with Next.js &amp; Drizzle ORM</span>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-900">
                Featured recipes
              </h2>
              <span className="text-xs text-zinc-500">Preview</span>
            </div>
            <div className="space-y-3">
              {featuredRecipes.map((recipe) => (
                <article
                  key={recipe.id}
                  className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 hover:border-orange-200"
                >
                  <div className="mt-0.5 h-14 w-14 flex-shrink-0 rounded-lg bg-gradient-to-br from-orange-400 to-red-400" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-orange-700">
                        {recipe.badge}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {recipe.time}
                      </span>
                    </div>
                    <h3 className="truncate text-sm font-semibold text-zinc-900">
                      {recipe.title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-zinc-600">
                      {recipe.description}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-emerald-700">
                      {recipe.difficulty} • Community favorite
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="mt-16 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
          <p>Recipe Share · Built with Next.js, Tailwind CSS, and Drizzle ORM.</p>
        </footer>
      </div>
    </div>
  )
}
