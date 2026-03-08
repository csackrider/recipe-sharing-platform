'use client'

import { useTransition } from 'react'
import { signOut } from '@/lib/actions/auth'

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => signOut())}
      disabled={isPending}
      className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:border-zinc-300 hover:bg-white disabled:opacity-50"
    >
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
