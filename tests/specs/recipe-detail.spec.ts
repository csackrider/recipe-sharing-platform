import { test, expect } from '../fixtures/auth.fixture'
import { test as unauthTest } from '@playwright/test'
import { RecipeDetailPage } from '../pages/RecipeDetailPage'
import { createTestRecipe, deleteRecipeById } from '../helpers/test-data'
import { USER1_STATE } from '../../playwright.config'

// ── Like button ───────────────────────────────────────────────────────────

test.describe('Recipe detail — like button (authenticated)', () => {
  let recipeId: string

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    recipeId = await createTestRecipe(page, { title: 'Recipe For Like Tests' })
    await context.close()
  })

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    await deleteRecipeById(page, recipeId)
    await context.close()
  })

  test('clicking like increments count by 1 and shows filled state', async ({ authenticatedPage }) => {
    const detailPage = new RecipeDetailPage(authenticatedPage)
    await detailPage.gotoRecipe(recipeId)

    const initialText = await detailPage.likeButton.textContent()
    const initialCount = parseInt(initialText ?? '0', 10)

    await detailPage.clickLike()

    await expect(detailPage.likeButton).not.toHaveText(String(initialCount))
  })

  test('clicking like again toggles off and decrements count', async ({ authenticatedPage }) => {
    const detailPage = new RecipeDetailPage(authenticatedPage)
    await detailPage.gotoRecipe(recipeId)

    // Read initial count
    const initialText = await detailPage.likeButton.textContent()
    const initialCount = parseInt(initialText ?? '0', 10)

    // First click toggles like on — count should change
    await detailPage.clickLike()
    await expect(detailPage.likeButton).not.toHaveText(String(initialCount), { timeout: 5_000 })

    const afterFirstClick = await detailPage.likeButton.textContent()
    const countAfterFirst = parseInt(afterFirstClick ?? '0', 10)

    // Second click toggles like off — count should revert
    await detailPage.clickLike()
    await expect(detailPage.likeButton).not.toHaveText(String(countAfterFirst), { timeout: 5_000 })
  })
})

unauthTest.describe('Recipe detail — like button (unauthenticated)', () => {
  let recipeId: string

  unauthTest.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    recipeId = await createTestRecipe(page, { title: 'Recipe For Guest Like Test' })
    await context.close()
  })

  unauthTest.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    await deleteRecipeById(page, recipeId)
    await context.close()
  })

  unauthTest('logged-out user clicking like redirects to /auth/login', async ({ page }) => {
    const detailPage = new RecipeDetailPage(page)
    await detailPage.gotoRecipe(recipeId)
    await detailPage.clickLikeAsGuest()
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})

// ── Save button ───────────────────────────────────────────────────────────

test.describe('Recipe detail — save button (authenticated)', () => {
  let recipeId: string

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    recipeId = await createTestRecipe(page, { title: 'Recipe For Save Tests' })
    await context.close()
  })

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    await deleteRecipeById(page, recipeId)
    await context.close()
  })

  test('clicking save shows "Saved" state', async ({ authenticatedPage }) => {
    const detailPage = new RecipeDetailPage(authenticatedPage)
    await detailPage.gotoRecipe(recipeId)

    const isSaved = await authenticatedPage.getByRole('button', { name: /^saved$/i }).isVisible()
    if (isSaved) {
      await authenticatedPage.getByRole('button', { name: /^saved$/i }).click()
      await detailPage.saveButton.waitFor({ state: 'visible' })
    }

    await detailPage.clickSave()
    await detailPage.assertSaveButtonShowsSaved()
  })

  test('clicking save again toggles back to unsaved state', async ({ authenticatedPage }) => {
    const detailPage = new RecipeDetailPage(authenticatedPage)
    await detailPage.gotoRecipe(recipeId)

    const isSaved = await authenticatedPage.getByRole('button', { name: /^saved$/i }).isVisible()
    if (!isSaved) {
      await detailPage.clickSave()
      await detailPage.assertSaveButtonShowsSaved()
    }

    await authenticatedPage.getByRole('button', { name: /^saved$/i }).click()
    await detailPage.assertSaveButtonShowsUnsaved()
  })
})

unauthTest.describe('Recipe detail — save button (unauthenticated)', () => {
  let recipeId: string

  unauthTest.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    recipeId = await createTestRecipe(page, { title: 'Recipe For Guest Save Test' })
    await context.close()
  })

  unauthTest.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    await deleteRecipeById(page, recipeId)
    await context.close()
  })

  unauthTest('logged-out user clicking save redirects to /auth/login', async ({ page }) => {
    const detailPage = new RecipeDetailPage(page)
    await detailPage.gotoRecipe(recipeId)
    await detailPage.clickSaveAsGuest()
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
