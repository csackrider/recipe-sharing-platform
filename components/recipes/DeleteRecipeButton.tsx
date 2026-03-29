'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteRecipe } from '@/lib/actions/recipes'

interface DeleteRecipeButtonProps {
  recipeId: string
}

export default function DeleteRecipeButton({ recipeId }: DeleteRecipeButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (confirming) {
    return (
      <div className="flex flex-col gap-2">
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">Are you sure?</span>
        <button
          onClick={() => {
            setError(null)
            startTransition(async () => {
              const result = await deleteRecipe(recipeId)
              if (result?.error) {
                setError(typeof result.error === 'string' ? result.error : 'Failed to delete recipe.')
              }
            })
          }}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          {isPending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-60"
        >
          Cancel
        </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  )
}
