import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

/**
 * Parameterised auth-guard tests.
 * Each protected route is visited by an unauthenticated user and must redirect to /auth/login.
 *
 * Note: /recipes/[id]/edit is not matched by proxy.ts (middleware), but the page itself
 * performs the auth check and redirects to /auth/login when there is no session.
 */
const protectedRoutes: string[] = [
  '/recipes/new',
  '/recipes/00000000-0000-0000-0000-000000000001/edit',
  '/profile/me',
]

for (const route of protectedRoutes) {
  test(`unauthenticated user on "${route}" is redirected to /auth/login`, { tag: '@smoke' }, async ({ page }) => {
    const loginPage = new LoginPage(page)
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    await loginPage.assertOnLoginPage()
  })
}
