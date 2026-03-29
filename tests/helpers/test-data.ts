import { type Page } from '@playwright/test'
import path from 'path'

// ── Env helpers ───────────────────────────────────────────────────────────

/** Return TEST_USER_USERNAME with any leading "@" stripped. */
export function getTestUsername(): string {
  return (process.env.TEST_USER_USERNAME ?? '').replace(/^@/, '')
}

/**
 * Log in via the UI and wait for the redirect to `/` to complete.
 * Use in `beforeAll` / `afterAll` hooks where the auth fixture isn't available.
 */
export async function loginViaUi(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  const { LoginPage } = await import('../pages/LoginPage')
  const loginPage = new LoginPage(page)
  await loginPage.login(email, password)
  await loginPage.assertLoginSuccessful()
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface RecipeData {
  title: string
  cookingTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  ingredient: string
  instructions: string
  category?: string
}

// ── Constants ─────────────────────────────────────────────────────────────

export const TEST_IMAGE_PATH = path.join(__dirname, '../resources/images/taco.jpg')

// ── Factories ─────────────────────────────────────────────────────────────

export function generateRecipeData(overrides?: Partial<RecipeData>): RecipeData {
  return {
    title: `E2E Test Recipe ${Date.now()}`,
    cookingTime: '30',
    difficulty: 'easy',
    ingredient: '1 cup water',
    instructions: 'Mix all ingredients together and cook until done.',
    ...overrides,
  }
}

// ── UI Helpers ────────────────────────────────────────────────────────────

/**
 * Creates a recipe via the UI (must be called with an authenticated page).
 * Returns the new recipe's ID extracted from the redirect URL.
 */
export async function createTestRecipe(
  page: Page,
  data?: Partial<RecipeData>,
): Promise<string> {
  const recipe = generateRecipeData(data)

  await page.goto('/recipes/new')
  await page.waitForLoadState('networkidle')

  await page.getByLabel(/title/i).fill(recipe.title)
  await page.getByLabel(/cook time/i).fill(recipe.cookingTime)
  await page.getByLabel(/difficulty/i).selectOption(recipe.difficulty)

  // Field array starts empty — click "Add ingredient" to create the first input
  const ingredientInput = page.getByPlaceholder(/2 cups flour/i)
  if (!(await ingredientInput.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: /add ingredient/i }).click()
  }
  await ingredientInput.fill(recipe.ingredient)

  await page.getByLabel(/instructions/i).fill(recipe.instructions)

  await page.getByRole('button', { name: /save recipe/i }).click()

  await page.waitForURL(/\/recipes\/(?!new)[^/]+$/, { timeout: 15_000 })

  const segments = page.url().split('/')
  return segments[segments.length - 1]
}

/**
 * Deletes the currently open recipe via the two-step delete UI.
 * Must be called while on a recipe detail page where the user is the owner.
 */
export async function deleteCurrentRecipe(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^delete$/i }).click()
  await page.getByRole('button', { name: /yes, delete/i }).click()
  await page.waitForURL('/recipes', { timeout: 10_000 })
}

/**
 * Navigates to a recipe by ID and deletes it.
 */
export async function deleteRecipeById(page: Page, recipeId: string): Promise<void> {
  await page.goto(`/recipes/${recipeId}`)
  await page.waitForLoadState('networkidle')
  await deleteCurrentRecipe(page)
}
