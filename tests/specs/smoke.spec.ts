import { test, expect } from '@playwright/test'
import { RecipesPage } from '../pages/RecipesPage'
import { PublicProfilePage } from '../pages/PublicProfilePage'
import { getTestUsername } from '../helpers/test-data'

test.describe('Smoke — public routes load without error', () => {
  test('home page loads', async ({ page }) => {
    const response = await page.goto('/')
    await expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveURL('/')
  })

  test('/recipes loads', async ({ page }) => {
    const recipesPage = new RecipesPage(page)
    await recipesPage.gotoFeed()
    await recipesPage.assertUrl('/recipes')
    // Page renders without a visible error heading
    await expect(page.getByRole('heading', { name: /error/i })).toBeHidden()
  })

  test('/recipes/[id] loads for a real recipe', async ({ page }) => {
    const recipesPage = new RecipesPage(page)
    await recipesPage.gotoFeed()

    const firstRecipeLink = page.getByRole('link').filter({ has: page.getByRole('heading') }).first()
    const hasRecipes = await firstRecipeLink.isVisible().catch(() => false)

    if (!hasRecipes) {
      test.skip(true, 'No recipes in the database — skipping detail page smoke test')
      return
    }

    await firstRecipeLink.click()
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/recipes\/[^/]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('/auth/login loads', async ({ page }) => {
    const response = await page.goto('/auth/login')
    await expect(response?.status()).toBeLessThan(400)
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('/auth/signup loads', async ({ page }) => {
    const response = await page.goto('/auth/signup')
    await expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveURL('/auth/signup')
  })

  test('/profile/[username] loads for TEST_USER', async ({ page }) => {
    const profilePage = new PublicProfilePage(page)
    const username = getTestUsername()
    await profilePage.gotoProfile(username)
    await profilePage.assertProfileVisible(username)
    await profilePage.assertRecipeCountVisible()
  })
})
