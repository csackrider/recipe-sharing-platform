import { test as base, type Page } from '@playwright/test'
import { USER1_STATE, USER2_STATE } from '../../playwright.config'

type MultiUserFixtures = {
  ownerPage: Page
  visitorPage: Page
}

export const test = base.extend<MultiUserFixtures>({
  ownerPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },

  visitorPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: USER2_STATE })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

export { expect } from '@playwright/test'
