import { describe, expect, it } from 'vitest'
import { recipeSchema } from '@/lib/validations/recipe'

const base = {
  title: 'My Recipe Title',
  instructions: 'These are clear instructions with enough length.',
  cooking_time: 30,
  difficulty: 'easy' as const,
  ingredients: ['2 cups flour', '1 egg'],
}

describe('recipeSchema', () => {
  it('accepts a valid recipe', () => {
    expect(recipeSchema.safeParse(base).success).toBe(true)
  })

  it('coerces string cooking_time to number', () => {
    const r = recipeSchema.safeParse({
      ...base,
      cooking_time: '45' as unknown as number,
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.cooking_time).toBe(45)
    }
  })

  it('rejects title shorter than 3 characters', () => {
    const r = recipeSchema.safeParse({ ...base, title: 'AB' })
    expect(r.success).toBe(false)
  })

  it('rejects instructions shorter than 10 characters', () => {
    const r = recipeSchema.safeParse({ ...base, instructions: 'Too short' })
    expect(r.success).toBe(false)
  })

  it('rejects cooking_time below 1', () => {
    const r = recipeSchema.safeParse({ ...base, cooking_time: 0 })
    expect(r.success).toBe(false)
  })

  it('rejects cooking_time above 1440', () => {
    const r = recipeSchema.safeParse({ ...base, cooking_time: 2000 })
    expect(r.success).toBe(false)
  })

  it('rejects invalid difficulty', () => {
    const r = recipeSchema.safeParse({
      ...base,
      difficulty: 'extreme',
    })
    expect(r.success).toBe(false)
  })

  it('rejects empty ingredients array', () => {
    const r = recipeSchema.safeParse({ ...base, ingredients: [] })
    expect(r.success).toBe(false)
  })

  it('rejects ingredient that is only whitespace after min length check', () => {
    const r = recipeSchema.safeParse({
      ...base,
      ingredients: [''],
    })
    expect(r.success).toBe(false)
  })

  it('accepts optional category', () => {
    const r = recipeSchema.safeParse({ ...base, category: 'Dinner' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.category).toBe('Dinner')
  })
})
