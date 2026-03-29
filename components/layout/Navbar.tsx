import Link from 'next/link'
import { auth } from '@/lib/auth'
import SignOutButton from '@/components/auth/SignOutButton'

export default async function Navbar() {
  const session = await auth()
  const user = session?.user

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-xs font-bold text-white">
            R
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900">
            Recipe Share
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm sm:flex">
          <Link
            href="/recipes"
            className="text-zinc-600 transition-colors hover:text-zinc-900"
          >
            Browse
          </Link>
          {user && (
            <Link
              href="/recipes/new"
              className="text-zinc-600 transition-colors hover:text-zinc-900"
            >
              New recipe
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <Link
                href="/profile/me"
                className="hidden max-w-[160px] truncate text-xs text-zinc-400 hover:text-zinc-700 sm:block"
              >
                {user.email}
              </Link>
              <Link
                href="/profile/me"
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 sm:hidden"
              >
                Profile
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full px-3 py-1.5 text-zinc-700 hover:bg-zinc-100"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-orange-500 px-3.5 py-1.5 font-medium text-white shadow-sm hover:bg-orange-600"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
