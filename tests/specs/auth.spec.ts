import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

test.describe('Authentication — happy path', () => {
  test('valid credentials redirect to home', { tag: '@smoke' }, async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.login(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!,
    )
    await loginPage.assertLoginSuccessful()
  })
})

test.describe('Authentication — validation errors', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto('/auth/login')
  })

  test('wrong password shows error message', async () => {
    await loginPage.login(process.env.TEST_USER_EMAIL!, 'wrong-password-xyz')
    await loginPage.assertLoginFailed()
  })

  test('invalid email format shows validation error', async ({ page }) => {
    await loginPage.emailInput.fill('not-an-email')
    await loginPage.passwordInput.fill('somepassword')
    // Bypass browser native HTML5 validation so RHF/Zod validation runs
    await page.evaluate(() => {
      document.querySelector('form')?.setAttribute('novalidate', '')
    })
    await loginPage.submitButton.click()
    await loginPage.assertValidationError()
  })

  test('empty form submission shows validation error', async ({ page }) => {
    // Bypass browser native HTML5 validation so RHF/Zod validation runs
    await page.evaluate(() => {
      document.querySelector('form')?.setAttribute('novalidate', '')
    })
    await loginPage.submitButton.click()
    await loginPage.assertValidationError()
  })
})

test.describe('Authentication — logged-in user behaviour', () => {
  test('already logged-in user on /auth/login sees authenticated navbar', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.login(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!,
    )
    await loginPage.assertLoginSuccessful()

    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')

    // The app does not redirect logged-in users from /auth/login,
    // but the navbar reflects authenticated state (sign out button visible).
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()
  })

  test('sign out redirects to /auth/login and clears user from navbar', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.login(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!,
    )
    await loginPage.assertLoginSuccessful()

    await loginPage.signOut()

    await loginPage.assertOnLoginPage()
    await loginPage.assertUserEmailNotInNavbar(process.env.TEST_USER_EMAIL!)
  })
})
