import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign in | Recipe Share',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
              R
            </div>
            <span className="text-base font-semibold tracking-tight text-zinc-900">
              Recipe Share
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Sign in to share and save your favorite recipes.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
