import { describe, expect, it } from 'vitest'
import { getCreditLimitUsage } from './credit-limit.util'

describe('getCreditLimitUsage', () => {
  it('computes the share used from the decimal strings the API returns', () => {
    expect(getCreditLimitUsage({ creditLimit: '1000.00', creditLimitUsed: '250.00' })).toEqual({
      total: 1000,
      used: 250,
      percent: 25
    })
  })

  it('clamps to 100 when the customer used more than the limit', () => {
    expect(getCreditLimitUsage({ creditLimit: '1000', creditLimitUsed: '1500' })).toEqual({
      total: 1000,
      used: 1500,
      percent: 100
    })
  })

  it('clamps to 0 on a negative used amount', () => {
    expect(getCreditLimitUsage({ creditLimit: '1000', creditLimitUsed: '-200' }).percent).toBe(0)
  })

  it('reports 0% when there is no limit registered', () => {
    expect(getCreditLimitUsage({ creditLimit: '0', creditLimitUsed: '500' })).toEqual({
      total: 0,
      used: 500,
      percent: 0
    })
  })

  it('treats missing, null and empty values as zero', () => {
    expect(getCreditLimitUsage({})).toEqual({ total: 0, used: 0, percent: 0 })
    expect(getCreditLimitUsage({ creditLimit: null, creditLimitUsed: null })).toEqual({ total: 0, used: 0, percent: 0 })
    expect(getCreditLimitUsage({ creditLimit: '', creditLimitUsed: '' })).toEqual({ total: 0, used: 0, percent: 0 })
  })

  it('survives a null customer', () => {
    expect(getCreditLimitUsage(null)).toEqual({ total: 0, used: 0, percent: 0 })
    expect(getCreditLimitUsage(undefined)).toEqual({ total: 0, used: 0, percent: 0 })
  })

  it('falls back to zero on unparseable text instead of NaN', () => {
    expect(getCreditLimitUsage({ creditLimit: 'abc', creditLimitUsed: '100' })).toEqual({
      total: 0,
      used: 100,
      percent: 0
    })
    expect(getCreditLimitUsage({ creditLimit: '1000', creditLimitUsed: 'abc' }).percent).toBe(0)
  })

  it('accepts plain numbers too', () => {
    expect(getCreditLimitUsage({ creditLimit: 200, creditLimitUsed: 50 }).percent).toBe(25)
  })
})
