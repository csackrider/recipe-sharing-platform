'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Breakfast', 'Lunch', 'Dinner', 'Dessert',
  'Snack', 'Soup', 'Salad', 'Vegan', 'Quick & Easy',
]

export default function RecipeFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const difficulty = searchParams.get('difficulty') ?? ''

  const hasFilters = q || category || difficulty

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset to page 1 whenever a filter changes
      params.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  const clearAll = () => {
    startTransition(() => {
      router.push(pathname)
    })
  }

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', isPending && 'opacity-60')}>
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          defaultValue={q}
          placeholder="Search recipes…"
          onChange={(e) => updateParam('q', e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Category filter */}
      <select
        value={category}
        onChange={(e) => updateParam('category', e.target.value)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 sm:w-44"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Difficulty filter */}
      <select
        value={difficulty}
        onChange={(e) => updateParam('difficulty', e.target.value)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 sm:w-36"
      >
        <option value="">Any difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  )
}
