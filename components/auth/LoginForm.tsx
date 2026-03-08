'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { signIn } from '@/lib/actions/auth'
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormValues) => {
    setServerError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)

      const result = await signIn(null, formData)
      if (result?.error) {
        setServerError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Email
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
            errors.email ? 'border-red-400' : 'border-zinc-200'
          )}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Password
        </label>
        <input
          {...register('password')}
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
            errors.password ? 'border-red-400' : 'border-zinc-200'
          )}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
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
          'flex w-full items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5',
          'text-sm font-medium text-white shadow-sm',
          'hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60'
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/signup"
          className="font-medium text-orange-600 hover:text-orange-700"
        >
          Sign up
        </Link>
      </p>
    </form>
  )
}
