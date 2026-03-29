import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const protectedPatterns = ['/recipes/new', '/profile/me']
      const isProtected =
        protectedPatterns.some((p) => pathname.startsWith(p)) ||
        /^\/recipes\/[^/]+\/edit/.test(pathname)
      if (isProtected && !auth?.user) return false
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
