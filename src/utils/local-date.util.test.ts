import { describe, expect, it } from 'vitest'
import { localDateKey } from './local-date.util'

describe('agenda local dates', () => {
  it('uses calendar components without converting to UTC', () => {
    const date = new Date(2026, 9, 16, 23, 59)
    expect(localDateKey(date)).toBe('2026-10-16')
    expect(localDateKey(new Date(2026, 9, 17, 0, 1))).toBe('2026-10-17')
  })
})
