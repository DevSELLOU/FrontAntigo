import { describe, expect, it } from 'vitest'
import { getUserInitials } from './get-user-initials.util'

describe('getUserInitials', () => {
  it('takes the first letter of the first and of the last name', () => {
    expect(getUserInitials('João Silva')).toBe('JS')
    expect(getUserInitials('Maria Aparecida de Souza')).toBe('MS')
  })

  it('returns a single letter for a single-word name', () => {
    expect(getUserInitials('João')).toBe('J')
  })

  it('ignores surrounding and repeated whitespace', () => {
    expect(getUserInitials('  joão   silva  ')).toBe('JS')
  })

  it('falls back to a placeholder when there is no name', () => {
    expect(getUserInitials(undefined)).toBe('?')
    expect(getUserInitials(null)).toBe('?')
    expect(getUserInitials('')).toBe('?')
    expect(getUserInitials('   ')).toBe('?')
  })
})
