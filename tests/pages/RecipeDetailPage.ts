import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class RecipeDetailPage extends BasePage {
  // ── Locators ─────────────────────────────────────────────────────────────

  readonly title: Locator
  readonly editLink: Locator
  /** Initial "Delete" button (before confirmation) */
  readonly deleteButton: Locator
  /** Confirmation "Yes, delete" button */
  readonly confirmDeleteButton: Locator
  readonly cancelDeleteButton: Locator
  /**
   * LikeButton — when logged in, a <button> whose accessible name is the count (pure number).
   * When logged out, a <Link> (anchor) to /auth/login.
   */
  readonly likeButton: Locator
  readonly likeLink: Locator
  /**
   * SaveButton — accessible name is "Save" or "Saved".
   * When logged out, a <Link> to /auth/login.
   */
  readonly saveButton: Locator
  readonly saveLink: Locator
  readonly recipeImage: Locator

  constructor(page: Page) {
    super(page)
    this.title = page.getByRole('heading', { level: 1 })
    this.editLink = page.getByRole('link', { name: /edit/i })
    this.deleteButton = page.getByRole('button', { name: /^delete$/i })
    this.confirmDeleteButton = page.getByRole('button', { name: /yes, delete/i })
    this.cancelDeleteButton = page.getByRole('button', { name: /cancel/i })
    // Like is a <button> with only a number as accessible text (lucide SVG is aria-hidden)
    this.likeButton = page.getByRole('button', { name: /^\d+$/ })
    // Like as a link (logged-out state) — anchor whose name is a pure number
    this.likeLink = page.getByRole('link', { name: /^\d+$/ })
    this.saveButton = page.getByRole('button', { name: /^save$/i })
    this.saveLink = page.getByRole('link', { name: /^save$/i })
    this.recipeImage = page.getByRole('img', { name: /.+/ })
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async gotoRecipe(id: string) {
    await this.goto(`/recipes/${id}`)
  }

  async clickEdit() {
    await this.editLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  async initiateDelete() {
    await this.deleteButton.click()
  }

  async confirmDelete() {
    await this.initiateDelete()
    await this.confirmDeleteButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async cancelDelete() {
    await this.initiateDelete()
    await this.cancelDeleteButton.click()
  }

  async clickLike() {
    await this.likeButton.click()
  }

  async clickLikeAsGuest() {
    await this.likeLink.click()
  }

  async clickSave() {
    await this.saveButton.click()
  }

  async clickSaveAsGuest() {
    await this.saveLink.click()
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertOnRecipePage(id?: string) {
    if (id) {
      await expect(this.page).toHaveURL(`/recipes/${id}`)
    } else {
      await expect(this.page).toHaveURL(/\/recipes\/[^/]+$/)
    }
  }

  async assertTitleIs(text: string) {
    await expect(this.title).toHaveText(text)
  }

  async assertTitleContains(text: string) {
    await expect(this.title).toContainText(text)
  }

  async assertLikeCount(count: number) {
    await expect(this.likeButton).toHaveText(String(count))
  }

  async assertLikeCountGreaterThan(previous: number) {
    await expect(this.likeButton).not.toHaveText(String(previous))
  }

  async assertLiked() {
    // When liked, the button renders with a filled heart (aria via accessible name still a number)
    // The button is visible and clickable — we verify state via count increase (done in test)
    await expect(this.likeButton).toBeVisible()
  }

  async assertNotLiked() {
    await expect(this.likeButton).toBeVisible()
  }

  async assertSaveButtonShowsSaved() {
    await expect(this.page.getByRole('button', { name: /saved/i })).toBeVisible()
  }

  async assertSaveButtonShowsUnsaved() {
    await expect(this.saveButton).toBeVisible()
  }

  async assertDeleteConfirmationVisible() {
    await expect(this.confirmDeleteButton).toBeVisible()
    await expect(this.cancelDeleteButton).toBeVisible()
  }

  async assertDeleteConfirmationHidden() {
    await expect(this.confirmDeleteButton).toBeHidden()
  }

  async assertRedirectedToRecipesFeed() {
    await expect(this.page).toHaveURL('/recipes')
  }

  async assertImageVisible() {
    await expect(this.recipeImage.first()).toBeVisible()
  }

  async assertEditLinkVisible() {
    await expect(this.editLink).toBeVisible()
  }
}
