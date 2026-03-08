'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { likeRecipe, unlikeRecipe } from '@/lib/actions/interactions'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  recipeId: string
  initialLiked: boolean
  initialCount: number
  userId?: string
}

export default function LikeButton({
  recipeId,
  initialLiked,
  initialCount,
  userId,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  const baseClass = cn(
    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
    liked ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
  )

  if (!userId) {
    return (
      <Link href="/auth/login" className={baseClass}>
        <Heart className="h-4 w-4" />
        {count}
      </Link>
    )
  }

  const toggle = () => {
    startTransition(async () => {
      const next = !liked
      setLiked(next)
      setCount((c) => (next ? c + 1 : c - 1))
      const result = next
        ? await likeRecipe(recipeId)
        : await unlikeRecipe(recipeId)
      if (result?.error) {
        setLiked(!next)
        setCount((c) => (next ? c - 1 : c + 1))
      }
    })
  }

  return (
    <button onClick={toggle} disabled={isPending} className={cn(baseClass, 'disabled:opacity-60')}>
      <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
      {count}
    </button>
  )
}
