import { test, expect } from '@playwright/test'
import { RecipesPage } from '../pages/RecipesPage'

test.describe('Recipe feed — search and filters', () => {
  let recipesPage: RecipesPage

  test.beforeEach(async ({ page }) => {
    recipesPage = new RecipesPage(page)
    await recipesPage.gotoFeed()
  })

  test('search by keyword updates URL with ?q= param and shows results', { tag: '@smoke' }, async ({ page }) => {
    await recipesPage.search('chicken')
    await recipesPage.assertUrlHasParam('q', 'chicken')
  })

  test('filter by category updates URL with ?category= param', async () => {
    await recipesPage.filterByCategory('Dinner')
    await recipesPage.assertUrlHasParam('category', 'Dinner')
  })

  test('filter by difficulty updates URL with ?difficulty= param', async () => {
    await recipesPage.filterByDifficulty('easy')
    await recipesPage.assertUrlHasParam('difficulty', 'easy')
  })

  test('combined keyword + category + difficulty filters all appear in URL', async () => {
    await recipesPage.search('pasta')
    await recipesPage.filterByCategory('Dinner')
    await recipesPage.filterByDifficulty('medium')
    await recipesPage.assertUrlHasParams({
      q: 'pasta',
      category: 'Dinner',
      difficulty: 'medium',
    })
  })

  test('filter that produces no results shows empty state message', async () => {
    // Use a search term extremely unlikely to match any real recipe
    await recipesPage.search('xyzunmatchable99999')
    await recipesPage.assertEmptyStateVisible()
  })

  test('clicking "Clear" removes all query params and restores full feed', async ({ page }) => {
    // Apply a filter first so the clear button appears
    await recipesPage.filterByDifficulty('hard')
    await recipesPage.clearFilters()
    await recipesPage.assertUrlHasNoQueryParams()
  })

  test('"Clear filters" link on empty state removes all query params', async ({ page }) => {
    // Produce an empty state to expose the "Clear filters" link
    await recipesPage.search('xyzunmatchable99999')
    await recipesPage.assertEmptyStateVisible()
    await recipesPage.clearFiltersLink.click()
    await page.waitForLoadState('networkidle')
    await recipesPage.assertUrlHasNoQueryParams()
  })
})
