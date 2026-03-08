'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import { saveRecipe, unsaveRecipe } from '@/lib/actions/interactions'
import { cn } from '@/lib/utils'

interface SaveButtonProps {
  recipeId: string
  initialSaved: boolean
  userId?: string
}

export default function SaveButton({ recipeId, initialSaved, userId }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()

  const baseClass = cn(
    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
    saved
      ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
  )

  if (!userId) {
    return (
      <Link href="/auth/login" className={baseClass}>
        <Bookmark className="h-4 w-4" />
        {saved ? 'Saved' : 'Save'}
      </Link>
    )
  }

  const toggle = () => {
    startTransition(async () => {
      const next = !saved
      setSaved(next)
      const result = next
        ? await saveRecipe(recipeId)
        : await unsaveRecipe(recipeId)
      if (result?.error) setSaved(!next)
    })
  }

  return (
    <button onClick={toggle} disabled={isPending} className={cn(baseClass, 'disabled:opacity-60')}>
      <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
