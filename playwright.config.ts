import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, 'tests/.env.test') })

export const USER1_STATE = path.join(__dirname, 'tests/.auth/user1.json')
export const USER2_STATE = path.join(__dirname, 'tests/.auth/user2.json')

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? undefined : undefined,
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'setup',
      testDir: './tests',
      testMatch: 'auth.setup.ts',
      retries: 2,
    },

    // Desktop
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: 'auth.spec.ts',
      dependencies: ['setup'],
    },
    {
      name: 'chromium-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'auth.spec.ts',
      dependencies: ['chromium'],
    },

    // Mobile
    {
      name: 'android',
      use: { ...devices['Pixel 7'] },
      testIgnore: 'auth.spec.ts',
      dependencies: ['setup'],
    },
    {
      name: 'iphone',
      use: { ...devices['iPhone 14'] },
      testIgnore: 'auth.spec.ts',
      dependencies: ['setup'],
    },

    // Tablet
    {
      name: 'ipad',
      use: { ...devices['iPad (gen 7)'] },
      testIgnore: 'auth.spec.ts',
      dependencies: ['setup'],
    },
  ],
})
