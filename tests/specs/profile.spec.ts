import { test } from '../fixtures/auth.fixture'
import { ProfileMePage } from '../pages/ProfileMePage'
import { createTestRecipe, deleteRecipeById } from '../helpers/test-data'

test.describe('Profile — edit profile', () => {
  test('updating display name and bio shows saved confirmation and values persist', async ({ authenticatedPage }) => {
    const profilePage = new ProfileMePage(authenticatedPage)
    await profilePage.goto()

    const newDisplayName = `Test User ${Date.now()}`
    const newBio = 'An E2E test bio.'

    await profilePage.updateProfile(newDisplayName, newBio)
    await profilePage.assertProfileSaved()

    await profilePage.goto()
    await profilePage.assertDisplayNameValue(newDisplayName)
    await profilePage.assertBioValue(newBio)
  })
})

test.describe('Profile — change password', () => {
  const TEMP_PASSWORD = 'E2eTempPass!99'

  test('valid new password (min 8 chars, matching confirm) shows success confirmation', async ({ authenticatedPage }) => {
    const profilePage = new ProfileMePage(authenticatedPage)
    await profilePage.goto()

    await profilePage.changePassword(TEMP_PASSWORD, TEMP_PASSWORD)

    try {
      await profilePage.assertPasswordChangeSuccess()
    } finally {
      await authenticatedPage.reload({ waitUntil: 'networkidle' })
      await profilePage.changePassword(
        process.env.TEST_USER_PASSWORD!,
        process.env.TEST_USER_PASSWORD!,
      )
      await profilePage.assertPasswordChangeSuccess()
    }
  })

  test('password under 8 characters shows validation error', async ({ authenticatedPage }) => {
    const profilePage = new ProfileMePage(authenticatedPage)
    await profilePage.goto()

    await profilePage.changePassword('short1', 'short1')
    await profilePage.assertPasswordChangeError('Password must be at least 8 characters')
  })

  test('passwords do not match shows validation error', async ({ authenticatedPage }) => {
    const profilePage = new ProfileMePage(authenticatedPage)
    await profilePage.goto()

    await profilePage.changePassword('ValidPass1', 'DifferentPass1')
    await profilePage.assertPasswordChangeError('Passwords do not match')
  })
})

test.describe('Profile — saved tab', () => {
  test('user with a saved recipe sees recipe card under Saved tab', async ({ authenticatedPage }) => {
    const recipeId = await createTestRecipe(authenticatedPage, { title: 'Recipe To Save' })

    const saveButton = authenticatedPage.getByRole('button', { name: /^save$/i })
    const alreadySaved = await authenticatedPage.getByRole('button', { name: /^saved$/i }).isVisible()
    if (!alreadySaved) {
      await saveButton.click()
      await authenticatedPage.getByRole('button', { name: /^saved$/i }).waitFor()
    }

    const profilePage = new ProfileMePage(authenticatedPage)
    await profilePage.gotoSavedTab()
    await profilePage.assertSavedRecipeCardVisible('Recipe To Save')

    // Cleanup: unsave and delete
    await authenticatedPage.goto(`/recipes/${recipeId}`)
    await authenticatedPage.waitForLoadState('networkidle')
    const savedBtn = authenticatedPage.getByRole('button', { name: /^saved$/i })
    if (await savedBtn.isVisible()) {
      await savedBtn.click()
    }
    await deleteRecipeById(authenticatedPage, recipeId)
  })

  test('user with no saved recipes sees empty state message', async ({ authenticatedPage }) => {
    const profilePage = new ProfileMePage(authenticatedPage)
    await profilePage.gotoSavedTab()

    await profilePage.assertOnProfilePage()
    await profilePage.assertEmptySavedState()
  })
})
