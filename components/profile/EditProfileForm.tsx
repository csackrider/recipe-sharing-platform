'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Check } from 'lucide-react'
import { updateProfile } from '@/lib/actions/profile'
import { profileSchema, type ProfileFormValues } from '@/lib/validations/profile'
import { cn } from '@/lib/utils'

interface EditProfileFormProps {
  defaultValues: ProfileFormValues
}

export default function EditProfileForm({ defaultValues }: EditProfileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  })

  const onSubmit = (data: ProfileFormValues) => {
    setServerError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateProfile(data)
      if (result && 'error' in result) {
        setServerError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="display_name"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Display name
        </label>
        <input
          {...register('display_name')}
          id="display_name"
          placeholder="Your name"
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
            errors.display_name ? 'border-red-400' : 'border-zinc-200'
          )}
        />
        {errors.display_name && (
          <p className="mt-1 text-xs text-red-500">{errors.display_name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="bio"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Bio
          <span className="ml-1 font-normal text-zinc-400">(max 200 characters)</span>
        </label>
        <textarea
          {...register('bio')}
          id="bio"
          rows={3}
          placeholder="A little about you and your cooking style…"
          className={cn(
            'w-full resize-none rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
            errors.bio ? 'border-red-400' : 'border-zinc-200'
          )}
        />
        {errors.bio && (
          <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          saved
            ? 'bg-emerald-500 text-white focus:ring-emerald-500'
            : 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
          'disabled:cursor-not-allowed disabled:opacity-60'
        )}
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
        ) : saved ? (
          <><Check className="h-4 w-4" /> Saved</>
        ) : (
          'Save changes'
        )}
      </button>
    </form>
  )
}
