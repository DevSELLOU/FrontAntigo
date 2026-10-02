import { describe, expect, it } from 'vitest'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { buildCustomerStatusSearch, parseCustomerFilters, readCustomerStatusFilter } from './status-filter.util'

describe('parseCustomerFilters', () => {
  it('returns an empty object when there is nothing to parse', () => {
    expect(parseCustomerFilters(null)).toEqual({})
    expect(parseCustomerFilters(undefined)).toEqual({})
    expect(parseCustomerFilters('')).toEqual({})
  })

  it('returns the conditions object as-is', () => {
    expect(parseCustomerFilters('{"city":{"like":"Campinas"},"status":{"eq":"ACTIVE"}}')).toEqual({
      city: { like: 'Campinas' },
      status: { eq: 'ACTIVE' }
    })
  })

  it('rejects malformed and non-object payloads instead of throwing', () => {
    expect(parseCustomerFilters('{not json')).toEqual({})
    expect(parseCustomerFilters('[1,2]')).toEqual({})
    expect(parseCustomerFilters('null')).toEqual({})
    expect(parseCustomerFilters('42')).toEqual({})
  })
})

describe('readCustomerStatusFilter', () => {
  it('reads ALL when there is no filters param', () => {
    expect(readCustomerStatusFilter(null)).toBe('ALL')
    expect(readCustomerStatusFilter(undefined)).toBe('ALL')
    expect(readCustomerStatusFilter('')).toBe('ALL')
  })

  it('reads the status out of the filters object', () => {
    expect(readCustomerStatusFilter('{"status":{"eq":"ACTIVE"}}')).toBe(CustomerStatus.Active)
    expect(readCustomerStatusFilter('{"status":{"eq":"DEFAULTING"}}')).toBe(CustomerStatus.Defaulting)
  })

  it('ignores other conditions sitting next to the status', () => {
    expect(readCustomerStatusFilter('{"city":{"like":"Campinas"},"status":{"eq":"INACTIVE"}}')).toBe(
      CustomerStatus.Inactive
    )
  })

  it('falls back to ALL on malformed JSON instead of throwing', () => {
    expect(readCustomerStatusFilter('{not json')).toBe('ALL')
    expect(readCustomerStatusFilter('[]')).toBe('ALL')
    expect(readCustomerStatusFilter('"ACTIVE"')).toBe('ALL')
  })

  it('falls back to ALL for a status the enum does not know', () => {
    expect(readCustomerStatusFilter('{"status":{"eq":"ARCHIVED"}}')).toBe('ALL')
  })

  it('falls back to ALL when status uses an operator other than eq', () => {
    expect(readCustomerStatusFilter('{"status":{"ne":"ACTIVE"}}')).toBe('ALL')
  })
})

describe('buildCustomerStatusSearch', () => {
  it('adds the status filter and resets the page', () => {
    const search = buildCustomerStatusSearch(new URLSearchParams('page=3'), CustomerStatus.Active)
    const params = new URLSearchParams(search)

    expect(JSON.parse(params.get('filters') as string)).toEqual({ status: { eq: 'ACTIVE' } })
    expect(params.get('page')).toBe('1')
  })

  it('keeps unrelated conditions when switching status', () => {
    const search = buildCustomerStatusSearch(
      new URLSearchParams(`filters=${encodeURIComponent('{"city":{"like":"Campinas"},"status":{"eq":"ACTIVE"}}')}`),
      CustomerStatus.Inactive
    )

    expect(JSON.parse(new URLSearchParams(search).get('filters') as string)).toEqual({
      city: { like: 'Campinas' },
      status: { eq: 'INACTIVE' }
    })
  })

  it('drops the filters param entirely when ALL empties the object', () => {
    const search = buildCustomerStatusSearch(
      new URLSearchParams(`filters=${encodeURIComponent('{"status":{"eq":"ACTIVE"}}')}`),
      'ALL'
    )

    expect(new URLSearchParams(search).has('filters')).toBe(false)
    expect(search).not.toContain('filters')
  })

  it('keeps the filters param on ALL when other conditions remain', () => {
    const search = buildCustomerStatusSearch(
      new URLSearchParams(`filters=${encodeURIComponent('{"city":{"like":"Campinas"},"status":{"eq":"ACTIVE"}}')}`),
      'ALL'
    )

    expect(JSON.parse(new URLSearchParams(search).get('filters') as string)).toEqual({
      city: { like: 'Campinas' }
    })
  })

  it('preserves query and sort untouched', () => {
    const search = buildCustomerStatusSearch(
      new URLSearchParams(`query=alfa&sort=${encodeURIComponent('{"fantasyName":"asc"}')}`),
      CustomerStatus.Defaulting
    )
    const params = new URLSearchParams(search)

    expect(params.get('query')).toBe('alfa')
    expect(params.get('sort')).toBe('{"fantasyName":"asc"}')
  })

  it('does not leave an empty filters param behind when there was none to begin with', () => {
    const search = buildCustomerStatusSearch(new URLSearchParams('query=alfa'), 'ALL')

    expect(new URLSearchParams(search).has('filters')).toBe(false)
  })

  it('recovers from a malformed filters param instead of throwing', () => {
    const search = buildCustomerStatusSearch(new URLSearchParams('filters=%7Bnot+json'), CustomerStatus.Active)

    expect(JSON.parse(new URLSearchParams(search).get('filters') as string)).toEqual({ status: { eq: 'ACTIVE' } })
  })

  it('does not mutate the URLSearchParams it receives', () => {
    const original = new URLSearchParams('page=4')
    buildCustomerStatusSearch(original, CustomerStatus.Active)

    expect(original.get('page')).toBe('4')
    expect(original.has('filters')).toBe(false)
  })
})
