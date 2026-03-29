import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class ProfileMePage extends BasePage {
  // ── Locators ─────────────────────────────────────────────────────────────

  // Edit profile form
  readonly displayNameInput: Locator
  readonly bioTextarea: Locator
  readonly saveProfileButton: Locator
  readonly savedConfirmation: Locator

  // Change password form
  readonly newPasswordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly updatePasswordButton: Locator
  readonly passwordSuccessMessage: Locator
  readonly passwordErrorMessage: Locator

  // Tabs
  readonly myRecipesTab: Locator
  readonly savedTab: Locator

  // Content
  readonly emptyStateSaved: Locator

  constructor(page: Page) {
    super(page)

    // Edit profile
    this.displayNameInput = page.getByLabel(/display name/i)
    this.bioTextarea = page.getByLabel(/bio/i)
    this.saveProfileButton = page.getByRole('button', { name: /save changes/i })
    // The submit button turns into "Saved" (green) on success
    this.savedConfirmation = page.getByRole('button', { name: /^saved$/i })

    // Change password
    this.newPasswordInput = page.getByLabel('New password', { exact: true })
    this.confirmPasswordInput = page.getByLabel('Confirm new password', { exact: true })
    this.updatePasswordButton = page.getByRole('button', { name: /update password/i })
    this.passwordSuccessMessage = page.getByText(/password updated successfully/i)
    this.passwordErrorMessage = page.locator('.text-red-500, .text-red-600').first()

    // Tabs
    this.myRecipesTab = page.getByRole('link', { name: /my recipes/i })
    this.savedTab = page.getByRole('link', { name: /^saved$/i })

    // Empty saved state
    this.emptyStateSaved = page.getByText(/no saved recipes yet/i)
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async goto() {
    await super.goto('/profile/me')
  }

  async gotoSavedTab() {
    await super.goto('/profile/me?tab=saved')
  }

  async updateProfile(displayName: string, bio: string) {
    await this.displayNameInput.fill(displayName)
    await this.bioTextarea.fill(bio)
    await this.saveProfileButton.click()
  }

  async changePassword(newPassword: string, confirmPassword: string) {
    await this.newPasswordInput.fill(newPassword)
    await this.confirmPasswordInput.fill(confirmPassword)
    await this.updatePasswordButton.click()
  }

  async switchToSavedTab() {
    await this.savedTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertOnProfilePage() {
    await expect(this.page).toHaveURL(/\/profile\/me/)
  }

  async assertProfileSaved() {
    await expect(this.savedConfirmation).toBeVisible()
  }

  async assertDisplayNameValue(value: string) {
    await expect(this.displayNameInput).toHaveValue(value)
  }

  async assertBioValue(value: string) {
    await expect(this.bioTextarea).toHaveValue(value)
  }

  async assertPasswordChangeSuccess() {
    await expect(this.passwordSuccessMessage).toBeVisible()
  }

  async assertPasswordChangeError(message?: string) {
    await expect(this.passwordErrorMessage).toBeVisible()
    if (message) {
      await expect(this.passwordErrorMessage).toContainText(message)
    }
  }

  async assertSavedRecipeCardVisible(recipeTitle: string) {
    await expect(this.page.getByRole('link', { name: new RegExp(recipeTitle, 'i') })).toBeVisible()
  }

  async assertEmptySavedState() {
    await expect(this.emptyStateSaved).toBeVisible()
  }
}
