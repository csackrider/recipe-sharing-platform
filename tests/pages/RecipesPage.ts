import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class RecipesPage extends BasePage {
  // ── Locators ─────────────────────────────────────────────────────────────

  readonly searchInput: Locator
  /** Category combobox (first <select> in the filter bar) */
  readonly categorySelect: Locator
  /** Difficulty combobox (second <select> in the filter bar) */
  readonly difficultySelect: Locator
  readonly clearButton: Locator
  readonly recipeGrid: Locator
  readonly emptyStateMessage: Locator
  readonly clearFiltersLink: Locator

  constructor(page: Page) {
    super(page)
    this.searchInput = page.getByPlaceholder('Search recipes…')
    this.categorySelect = page.getByRole('combobox').nth(0)
    this.difficultySelect = page.getByRole('combobox').nth(1)
    this.clearButton = page.getByRole('button', { name: /clear/i })
    this.recipeGrid = page.locator('main, [class*="grid"]').filter({ has: page.getByRole('link').filter({ has: page.getByRole('heading') }) }).first()
    this.emptyStateMessage = page.getByText(/no recipes match your search/i)
    this.clearFiltersLink = page.getByRole('link', { name: /clear filters/i })
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async gotoFeed() {
    await this.goto('/recipes')
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword)
    await this.page.waitForURL(new RegExp(`[?&]q=`), { timeout: 10_000 })
  }

  async filterByCategory(category: string) {
    await this.categorySelect.selectOption(category)
    await this.page.waitForURL(new RegExp(`[?&]category=`), { timeout: 10_000 })
  }

  async filterByDifficulty(difficulty: string) {
    await this.difficultySelect.selectOption(difficulty)
    await this.page.waitForURL(new RegExp(`[?&]difficulty=`), { timeout: 10_000 })
  }

  async clearFilters() {
    await this.clearButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertUrlHasParam(key: string, value: string) {
    await expect(this.page).toHaveURL(new RegExp(`[?&]${key}=${encodeURIComponent(value)}`))
  }

  async assertUrlHasParams(params: Record<string, string>) {
    for (const [key, value] of Object.entries(params)) {
      await this.assertUrlHasParam(key, value)
    }
  }

  async assertUrlHasNoQueryParams() {
    await expect(this.page).toHaveURL('/recipes')
  }

  async assertRecipeCardsVisible() {
    await expect(this.page.getByRole('link').filter({ has: this.page.getByRole('heading') }).first()).toBeVisible()
  }

  async assertEmptyStateVisible() {
    await expect(this.emptyStateMessage).toBeVisible()
  }

  async assertClearFiltersLinkVisible() {
    await expect(this.clearFiltersLink).toBeVisible()
  }
}
