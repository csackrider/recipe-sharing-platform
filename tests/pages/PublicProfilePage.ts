import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class PublicProfilePage extends BasePage {
  // ── Locators ─────────────────────────────────────────────────────────────

  readonly usernameDisplay: Locator
  readonly recipeCountDisplay: Locator
  readonly notFoundIndicator: Locator

  constructor(page: Page) {
    super(page)
    // The profile card shows "@username" as a small text
    this.usernameDisplay = page.locator('p').filter({ hasText: /^@/ })
    // Recipe count is a large number followed by "recipes shared" / "recipe shared"
    this.recipeCountDisplay = page.getByText(/recipes?\s+shared/i)
    // Not-found state: Next.js renders an <h1>404</h1> heading
    this.notFoundIndicator = page.getByRole('heading', { name: '404' })
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async gotoProfile(username: string) {
    await this.goto(`/profile/${username}`)
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertProfileVisible(username: string) {
    await expect(this.page).toHaveURL(`/profile/${username}`)
    await expect(this.usernameDisplay).toBeVisible()
  }

  async assertRecipeCountVisible() {
    await expect(this.recipeCountDisplay).toBeVisible()
  }

  async assertRecipeGridVisible() {
    // At least one recipe link exists, or the heading "[name]'s recipes" is present
    await expect(this.page.getByRole('heading').filter({ hasText: /recipes/i }).first()).toBeVisible()
  }

  async assertNotFoundVisible() {
    await expect(this.notFoundIndicator).toBeVisible()
  }
}
