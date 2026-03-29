import { test, expect } from '../fixtures/auth.fixture'
import { test as multiUserTest } from '../fixtures/multi-user.fixture'
import { RecipeFormPage } from '../pages/RecipeFormPage'
import { RecipeDetailPage } from '../pages/RecipeDetailPage'
import { generateRecipeData, createTestRecipe, deleteRecipeById, TEST_IMAGE_PATH } from '../helpers/test-data'
import { USER1_STATE } from '../../playwright.config'

// ── Create ─────────────────────────────────────────────────────────────────

test.describe('Recipe CRUD — create', () => {
  test('valid form without image redirects to new recipe detail page', async ({ authenticatedPage }) => {
    const formPage = new RecipeFormPage(authenticatedPage)
    await formPage.gotoNewRecipe()

    const recipe = generateRecipeData({ title: 'No Image Recipe' })
    await formPage.fillAndSubmit({
      title: recipe.title,
      cookingTime: recipe.cookingTime,
      difficulty: recipe.difficulty,
      ingredient: recipe.ingredient,
      instructions: recipe.instructions,
    })

    await formPage.assertRedirectedToRecipeDetail()

    const recipeId = authenticatedPage.url().split('/').pop()!
    await deleteRecipeById(authenticatedPage, recipeId)
  })

  test('valid form with image redirects and displays uploaded image', async ({ authenticatedPage }) => {
    const formPage = new RecipeFormPage(authenticatedPage)
    await formPage.gotoNewRecipe()

    const recipe = generateRecipeData({ title: 'Image Upload Recipe' })
    await formPage.fillAndSubmit({
      title: recipe.title,
      cookingTime: recipe.cookingTime,
      difficulty: recipe.difficulty,
      ingredient: recipe.ingredient,
      instructions: recipe.instructions,
      imagePath: TEST_IMAGE_PATH,
    })

    await formPage.assertRedirectedToRecipeDetail()
    await formPage.assertRecipeImageDisplayed()

    const recipeId = authenticatedPage.url().split('/').pop()!
    await deleteRecipeById(authenticatedPage, recipeId)
  })

  test('title under 3 characters shows validation error', async ({ authenticatedPage }) => {
    const formPage = new RecipeFormPage(authenticatedPage)
    await formPage.gotoNewRecipe()

    await formPage.fillAndSubmit({
      title: 'AB',
      cookingTime: '30',
      difficulty: 'easy',
      ingredient: 'water',
      instructions: 'Cook everything together well.',
    })

    await formPage.assertTitleError()
  })

  test('no difficulty selected shows validation error', async ({ authenticatedPage }) => {
    const formPage = new RecipeFormPage(authenticatedPage)
    await formPage.gotoNewRecipe()

    await formPage.fillAndSubmit({
      title: 'Valid Title',
      cookingTime: '30',
      difficulty: '',
      ingredient: 'water',
      instructions: 'Cook everything together well.',
    })

    await formPage.assertDifficultyError()
  })

  test('empty ingredient field shows validation error', async ({ authenticatedPage }) => {
    const formPage = new RecipeFormPage(authenticatedPage)
    await formPage.gotoNewRecipe()

    // Add an ingredient, type into it, then clear it so RHF registers the empty value
    await formPage.addIngredientButton.click()
    const ingredientInput = authenticatedPage.getByPlaceholder(/2 cups flour/i)
    await ingredientInput.type('temp')
    await ingredientInput.fill('')

    await formPage.titleInput.fill('Valid Title')
    await formPage.cookingTimeInput.fill('30')
    await formPage.difficultySelect.selectOption('easy')
    await formPage.instructionsTextarea.fill('Cook everything together well.')
    await formPage.submit()

    // Validation should prevent redirect — page stays on /recipes/new
    await expect(authenticatedPage).toHaveURL(/\/recipes\/new/)
  })

  test('instructions under 10 characters shows validation error', async ({ authenticatedPage }) => {
    const formPage = new RecipeFormPage(authenticatedPage)
    await formPage.gotoNewRecipe()

    await formPage.fillAndSubmit({
      title: 'Valid Title',
      cookingTime: '30',
      difficulty: 'easy',
      ingredient: 'water',
      instructions: 'Short',
    })

    await formPage.assertInstructionsError()
  })
})

// ── Edit ──────────────────────────────────────────────────────────────────

test.describe('Recipe CRUD — edit', () => {
  let recipeId: string

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    recipeId = await createTestRecipe(page, { title: 'Recipe For Edit Test' })
    await context.close()
  })

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    await deleteRecipeById(page, recipeId)
    await context.close()
  })

  test('owner edits recipe — changes saved and detail page reflects new values', async ({ authenticatedPage }) => {
    const formPage = new RecipeFormPage(authenticatedPage)
    await formPage.gotoEditRecipe(recipeId)

    const updatedTitle = `Updated Recipe ${Date.now()}`
    await formPage.titleInput.fill(updatedTitle)
    await formPage.submit()

    const detailPage = new RecipeDetailPage(authenticatedPage)
    await detailPage.assertOnRecipePage(recipeId)
    await detailPage.assertTitleIs(updatedTitle)
  })
})

// ── Owner vs visitor (edit) ───────────────────────────────────────────────

multiUserTest.describe('Recipe CRUD — non-owner cannot edit', () => {
  let recipeId: string

  multiUserTest.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    recipeId = await createTestRecipe(page, { title: 'Owner Recipe For Visitor Test' })
    await context.close()
  })

  multiUserTest.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER1_STATE })
    const page = await context.newPage()
    await deleteRecipeById(page, recipeId)
    await context.close()
  })

  multiUserTest(
    'TEST_USER_2 navigating to owner edit URL is redirected away',
    async ({ visitorPage }) => {
      const formPage = new RecipeFormPage(visitorPage)
      await formPage.gotoEditRecipe(recipeId)
      await formPage.assertCurrentUrl(recipeId)
      await expect(visitorPage.getByRole('button', { name: /save changes/i })).toBeHidden()
    },
  )
})

// ── Delete ────────────────────────────────────────────────────────────────

test.describe('Recipe CRUD — delete', () => {
  test('owner confirms delete — recipe removed and redirected to /recipes', async ({ authenticatedPage }) => {
    const recipeId = await createTestRecipe(authenticatedPage, { title: 'Recipe To Delete' })

    const detailPage = new RecipeDetailPage(authenticatedPage)
    await detailPage.gotoRecipe(recipeId)
    await detailPage.confirmDelete()

    await detailPage.assertRedirectedToRecipesFeed()
  })

  test('owner opens delete confirmation then cancels — remains on recipe detail', async ({ authenticatedPage }) => {
    const recipeId = await createTestRecipe(authenticatedPage, { title: 'Recipe Cancel Delete' })

    const detailPage = new RecipeDetailPage(authenticatedPage)
    await detailPage.gotoRecipe(recipeId)
    await detailPage.cancelDelete()

    await detailPage.assertDeleteConfirmationHidden()
    await detailPage.assertOnRecipePage(recipeId)

    await deleteRecipeById(authenticatedPage, recipeId)
  })
})
