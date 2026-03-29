import { test as setup, expect } from '@playwright/test'
import path from 'path'

const USER1_STATE = path.join(__dirname, '.auth/user1.json')
const USER2_STATE = path.join(__dirname, '.auth/user2.json')

export { USER1_STATE, USER2_STATE }

setup('authenticate primary user', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/auth/login')
  await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!)
  await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL('/', { timeout: 15_000 })
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()
  await page.context().storageState({ path: USER1_STATE })
})

setup('authenticate secondary user', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/auth/login')
  await page.getByLabel(/email/i).fill(process.env.TEST_USER_2_EMAIL!)
  await page.getByLabel(/password/i).fill(process.env.TEST_USER_2_PASSWORD!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL('/', { timeout: 15_000 })
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()
  await page.context().storageState({ path: USER2_STATE })
})
