import { describe, expect, it } from 'vitest'
import { countActiveFilters } from './count-active-filters'

describe('countActiveFilters', () => {
  it('counts nothing when the filters param is absent or empty', () => {
    expect(countActiveFilters(new URLSearchParams())).toBe(0)
    expect(countActiveFilters(new URLSearchParams('page=2'))).toBe(0)
    expect(countActiveFilters(new URLSearchParams('filters='))).toBe(0)
  })

  it('counts one entry per condition in the filters object', () => {
    const params = new URLSearchParams(
      `filters=${encodeURIComponent('{"status":{"eq":"ACTIVE"},"city":{"like":"Campinas"}}')}`
    )
    expect(countActiveFilters(params)).toBe(2)
  })

  it('returns 0 on a malformed filters param instead of throwing', () => {
    expect(countActiveFilters(new URLSearchParams('filters=%7Bnot+json'))).toBe(0)
  })

  it('counts an empty filters object as zero', () => {
    expect(countActiveFilters(new URLSearchParams(`filters=${encodeURIComponent('{}')}`))).toBe(0)
  })

  it('ignores excluded keys when asked to', () => {
    const params = new URLSearchParams(
      `filters=${encodeURIComponent('{"status":{"eq":"ACTIVE"},"city":{"like":"Campinas"}}')}`
    )
    expect(countActiveFilters(params, { exclude: ['status'] })).toBe(1)
  })

  it('reports zero when every condition is excluded', () => {
    const params = new URLSearchParams(`filters=${encodeURIComponent('{"status":{"eq":"ACTIVE"}}')}`)
    expect(countActiveFilters(params, { exclude: ['status'] })).toBe(0)
  })

  it('is unaffected by an exclude list that matches nothing', () => {
    const params = new URLSearchParams(`filters=${encodeURIComponent('{"city":{"like":"Campinas"}}')}`)
    expect(countActiveFilters(params, { exclude: ['status'] })).toBe(1)
    expect(countActiveFilters(params, { exclude: [] })).toBe(1)
  })
})
