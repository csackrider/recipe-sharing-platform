import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export interface RecipeFormData {
  title?: string
  cookingTime?: string
  difficulty?: 'easy' | 'medium' | 'hard' | ''
  category?: string
  ingredient?: string
  instructions?: string
  imagePath?: string
}

export class RecipeFormPage extends BasePage {
  // ── Locators ─────────────────────────────────────────────────────────────

  readonly titleInput: Locator
  readonly cookingTimeInput: Locator
  readonly difficultySelect: Locator
  readonly categorySelect: Locator
  readonly addIngredientButton: Locator
  readonly instructionsTextarea: Locator
  readonly fileInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    super(page)
    this.titleInput = page.getByLabel(/title/i)
    this.cookingTimeInput = page.getByLabel(/cook time/i)
    this.difficultySelect = page.getByLabel(/difficulty/i)
    this.categorySelect = page.getByLabel(/category/i)
    this.addIngredientButton = page.getByRole('button', { name: /add ingredient/i })
    this.instructionsTextarea = page.getByLabel(/instructions/i)
    this.fileInput = page.locator('input[type="file"]')
    this.submitButton = page.getByRole('button', { name: /save recipe|save changes/i })
    this.errorMessage = page.locator('.text-red-500, .text-red-600').first()
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async gotoNewRecipe() {
    await this.goto('/recipes/new')
  }

  async gotoEditRecipe(id: string) {
    await this.goto(`/recipes/${id}/edit`)
  }

  async fillForm(data: RecipeFormData) {
    if (data.title !== undefined) await this.titleInput.fill(data.title)
    if (data.cookingTime !== undefined) await this.cookingTimeInput.fill(data.cookingTime)
    if (data.difficulty !== undefined) await this.difficultySelect.selectOption(data.difficulty)
    if (data.category !== undefined) await this.categorySelect.selectOption(data.category)
    if (data.ingredient !== undefined) {
      // The field array starts empty; click "Add ingredient" to create the first input
      const ingredientInput = this.page.getByPlaceholder(/2 cups flour/i)
      if (!(await ingredientInput.isVisible().catch(() => false))) {
        await this.addIngredientButton.click()
      }
      await ingredientInput.fill(data.ingredient)
    }
    if (data.instructions !== undefined) await this.instructionsTextarea.fill(data.instructions)
    if (data.imagePath !== undefined) {
      await this.fileInput.setInputFiles(data.imagePath)
    }
  }

  async submit() {
    await this.submitButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async fillAndSubmit(data: RecipeFormData) {
    await this.fillForm(data)
    await this.submit()
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertRedirectedToRecipeDetail() {
    await expect(this.page).toHaveURL(/\/recipes\/(?!new)[^/]+$/, { timeout: 15_000 })
  }

  async assertRedirectedToEditedRecipe(id: string) {
    await expect(this.page).toHaveURL(`/recipes/${id}`)
  }

  async assertValidationError(message?: string) {
    await expect(this.errorMessage).toBeVisible()
    if (message) {
      await expect(this.errorMessage).toContainText(message)
    }
  }

  async assertTitleError() {
    await expect(this.page.getByText(/title must be at least 3 characters/i)).toBeVisible()
  }

  async assertDifficultyError() {
    const errorLocator = this.page.getByText(/invalid option|please select a difficulty/i)
    await expect(errorLocator).toBeVisible()
  }

  async assertIngredientError() {
    const errorLocator = this.page.getByText(/ingredient cannot be empty|add at least one ingredient/i)
    await expect(errorLocator).toBeVisible()
  }

  async assertInstructionsError() {
    await expect(this.page.getByText(/instructions must be at least 10 characters/i)).toBeVisible()
  }

  async assertCurrentUrl(id?: string) {
    if (id) {
      await expect(this.page).toHaveURL(`/recipes/${id}`)
    } else {
      await expect(this.page).toHaveURL(/\/recipes\/[^/]+$/)
    }
  }

  async assertRecipeImageDisplayed() {
    await expect(this.page.getByRole('img').first()).toBeVisible()
  }
}
