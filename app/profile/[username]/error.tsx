'use client'

import Link from 'next/link'

export default function ProfileError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="text-center">
        <p className="mb-1 text-base font-semibold text-zinc-800">Profile not found</p>
        <p className="mb-4 text-sm text-zinc-500">
          This profile doesn&apos;t exist or something went wrong.
        </p>
        <Link
          href="/recipes"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          Browse recipes
        </Link>
      </div>
    </div>
  )
}
