import { describe, expect, it } from 'vitest'
import { profileSchema } from '@/lib/validations/profile'

describe('profileSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const r = profileSchema.safeParse({})
    expect(r.success).toBe(true)
  })

  it('accepts display_name and bio within limits', () => {
    const r = profileSchema.safeParse({
      display_name: 'Chef Pat',
      bio: 'I love cooking.',
    })
    expect(r.success).toBe(true)
  })

  it('rejects display_name over 50 characters', () => {
    const r = profileSchema.safeParse({
      display_name: 'a'.repeat(51),
    })
    expect(r.success).toBe(false)
  })

  it('rejects bio over 200 characters', () => {
    const r = profileSchema.safeParse({
      bio: 'x'.repeat(201),
    })
    expect(r.success).toBe(false)
  })
})
