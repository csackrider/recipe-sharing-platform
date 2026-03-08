'use client'

import Link from 'next/link'

export default function RecipeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="text-center">
        <p className="mb-2 text-sm font-medium text-red-500">Something went wrong</p>
        <p className="mb-6 text-sm text-zinc-500">
          We couldn&apos;t load this recipe. Please try again.
        </p>
        <Link
          href="/"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
