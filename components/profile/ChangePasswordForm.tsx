'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { changePassword } from '@/lib/actions/auth'
import { changePasswordSchema, type ChangePasswordValues } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'

export default function ChangePasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = (data: ChangePasswordValues) => {
    setServerError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await changePassword(data)
      if ('error' in result) {
        setServerError(result.error)
      } else {
        setSuccess(true)
        reset()
      }
    })
  }

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border px-3 py-2 text-sm text-zinc-900',
      'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
      hasError ? 'border-red-400' : 'border-zinc-200'
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700">
          New password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={cn(inputClass(!!errors.password), 'pr-10')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Confirm new password
        </label>
        <input
          {...register('confirmPassword')}
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          className={inputClass(!!errors.confirmPassword)}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
      )}

      {success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Password updated successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'flex w-full items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5',
          'text-sm font-medium text-white shadow-sm',
          'hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60'
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating…
          </>
        ) : (
          'Update password'
        )}
      </button>
    </form>
  )
}
