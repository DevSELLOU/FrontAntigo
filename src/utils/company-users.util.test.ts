import { describe, expect, it } from 'vitest'
import { normalizeCompanyUsers } from './company-users.util'

describe('normalizeCompanyUsers', () => {
  it('returns an empty array when users is undefined or null', () => {
    expect(normalizeCompanyUsers(undefined)).toEqual([])
    expect(normalizeCompanyUsers(null as any)).toEqual([])
  })

  it('returns an empty array when users is not an array', () => {
    expect(normalizeCompanyUsers({} as any)).toEqual([])
  })

  it('extracts id and name from flat User objects', () => {
    const users = [{ id: 1, name: 'João' }, { id: 2, name: 'Maria' }] as any
    expect(normalizeCompanyUsers(users)).toEqual([
      { id: 1, name: 'João' },
      { id: 2, name: 'Maria' }
    ])
  })

  it('extracts id and name from nested user (UserCompany shape)', () => {
    const users = [
      { id: 100, userId: 7, companyId: 1, user: { id: 7, name: 'João' } },
      { id: 101, userId: 8, companyId: 1, user: { id: 8, name: 'Maria' } }
    ] as any
    expect(normalizeCompanyUsers(users)).toEqual([
      { id: 7, name: 'João' },
      { id: 8, name: 'Maria' }
    ])
  })

  it('prefers the nested user id over the UserCompany id', () => {
    const users = [{ id: 999, userId: 5, user: { id: 5, name: 'Carlos' } }] as any
    const result = normalizeCompanyUsers(users)
    expect(result[0].id).toBe(5)
  })

  it('filters out entries without a valid id or name', () => {
    const users = [
      { id: 1, name: 'João' },
      { id: 2, name: '' },
      { id: null, name: 'Sem Id' },
      { user: { id: 3 } }
    ] as any
    expect(normalizeCompanyUsers(users)).toEqual([{ id: 1, name: 'João' }])
  })

  it('handles empty array input', () => {
    expect(normalizeCompanyUsers([])).toEqual([])
  })
})
