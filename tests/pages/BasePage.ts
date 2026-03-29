import { type Page, expect } from '@playwright/test'

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  // ── Actions ──────────────────────────────────────────────────────────────

  async goto(path: string) {
    await this.page.goto(path)
    await this.page.waitForLoadState('networkidle')
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async assertUrl(urlOrPattern: string | RegExp) {
    await expect(this.page).toHaveURL(urlOrPattern)
  }

  async assertNotUrl(pattern: RegExp) {
    await expect(this.page).not.toHaveURL(pattern)
  }

  async assertHeadingVisible(text: string | RegExp) {
    await expect(this.page.getByRole('heading', { name: text })).toBeVisible()
  }
}
