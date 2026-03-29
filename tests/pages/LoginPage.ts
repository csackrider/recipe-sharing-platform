import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  // ── Locators ─────────────────────────────────────────────────────────────

  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  /** Covers both client-side (.text-red-500) and server-side (.text-red-600) error messages */
  readonly errorMessage: Locator
  readonly signOutButton: Locator

  constructor(page: Page) {
    super(page)
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: /sign in/i })
    this.errorMessage = page.locator('.text-red-500, .text-red-600').first()
    this.signOutButton = page.getByRole('button', { name: /sign out/i })
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    await this.goto('/auth/login')
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async signOut() {
    await this.signOutButton.click()
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertLoginSuccessful() {
    await expect(this.page).toHaveURL('/')
  }

  async assertLoginFailed() {
    await expect(this.errorMessage).toBeVisible()
  }

  async assertValidationError(message?: string) {
    await expect(this.errorMessage).toBeVisible()
    if (message) {
      await expect(this.errorMessage).toContainText(message)
    }
  }

  async assertOnLoginPage() {
    await expect(this.page).toHaveURL(/\/auth\/login/)
  }

  async assertNotOnLoginPage() {
    await expect(this.page).not.toHaveURL(/\/auth\/login/)
  }

  async assertSignedOut() {
    // After sign-out the app redirects to /auth/login
    await expect(this.page).toHaveURL(/\/auth\/login/)
    // Navbar email link is gone
    await expect(this.page.getByRole('link', { name: /sign out/i })).toBeHidden()
  }

  async assertUserEmailNotInNavbar(email: string) {
    await expect(this.page.getByText(email)).toBeHidden()
  }
}
