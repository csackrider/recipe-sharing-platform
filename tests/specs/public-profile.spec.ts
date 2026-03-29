import { test, expect } from '@playwright/test'
import { PublicProfilePage } from '../pages/PublicProfilePage'
import { getTestUsername } from '../helpers/test-data'

test.describe('Public profile page', () => {
  test('valid /profile/[username] shows username, recipe count, and recipe grid', async ({ page }) => {
    const profilePage = new PublicProfilePage(page)
    const username = getTestUsername()
    await profilePage.gotoProfile(username)

    await profilePage.assertProfileVisible(username)
    await profilePage.assertRecipeCountVisible()
    await profilePage.assertRecipeGridVisible()
  })

  test('non-existent username shows not-found state', async ({ page }) => {
    const profilePage = new PublicProfilePage(page)
    await profilePage.gotoProfile('this-username-does-not-exist-e2e')
    await profilePage.assertNotFoundVisible()
  })
})
