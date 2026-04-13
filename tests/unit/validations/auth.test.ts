import { describe, expect, it } from 'vitest'
import {
  changePasswordSchema,
  loginSchema,
  signupSchema,
} from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const r = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret',
    })
    expect(r.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const r = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes('email'))).toBe(true)
    }
  })

  it('rejects password shorter than 6 characters', () => {
    const r = loginSchema.safeParse({ email: 'a@b.co', password: '12345' })
    expect(r.success).toBe(false)
  })
})

describe('signupSchema', () => {
  const valid = {
    email: 'new@example.com',
    password: 'ValidPass1',
    confirmPassword: 'ValidPass1',
  }

  it('accepts matching passwords with uppercase and number', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects when passwords do not match', () => {
    const r = signupSchema.safeParse({
      ...valid,
      confirmPassword: 'OtherPass1',
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message.includes('do not match'))).toBe(
        true,
      )
    }
  })

  it('rejects password without uppercase', () => {
    const r = signupSchema.safeParse({
      ...valid,
      password: 'validpass1',
      confirmPassword: 'validpass1',
    })
    expect(r.success).toBe(false)
  })

  it('rejects password without number', () => {
    const r = signupSchema.safeParse({
      ...valid,
      password: 'ValidPassx',
      confirmPassword: 'ValidPassx',
    })
    expect(r.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const r = signupSchema.safeParse({
      ...valid,
      password: 'Short1A',
      confirmPassword: 'Short1A',
    })
    expect(r.success).toBe(false)
  })
})

describe('changePasswordSchema', () => {
  it('accepts matching passwords of at least 8 characters', () => {
    const r = changePasswordSchema.safeParse({
      password: 'NewPass99',
      confirmPassword: 'NewPass99',
    })
    expect(r.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const r = changePasswordSchema.safeParse({
      password: 'NewPass99',
      confirmPassword: 'NewPass00',
    })
    expect(r.success).toBe(false)
  })

  it('rejects password under 8 characters', () => {
    const r = changePasswordSchema.safeParse({
      password: 'short1',
      confirmPassword: 'short1',
    })
    expect(r.success).toBe(false)
  })
})
