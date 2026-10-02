import { describe, expect, it } from 'vitest'
import { DEFAULT_PROFILE_TAB, PROFILE_TABS, parseProfileTab } from './profile-tab.util'

describe('PROFILE_TABS', () => {
  it('lists the five profile tabs in reading order', () => {
    expect(PROFILE_TABS.map(tab => tab.value)).toEqual(['dados', 'contatos', 'atendimentos', 'pedidos', 'usuarios'])
  })

  it('starts on Dados', () => {
    expect(DEFAULT_PROFILE_TAB).toBe('dados')
    expect(PROFILE_TABS[0].value).toBe(DEFAULT_PROFILE_TAB)
  })
})

describe('parseProfileTab', () => {
  it('accepts every known tab', () => {
    for (const tab of PROFILE_TABS) {
      expect(parseProfileTab(tab.value)).toBe(tab.value)
    }
  })

  it('falls back to dados for an unknown, empty or missing value', () => {
    expect(parseProfileTab('financeiro')).toBe('dados')
    expect(parseProfileTab('')).toBe('dados')
    expect(parseProfileTab(null)).toBe('dados')
    expect(parseProfileTab(undefined)).toBe('dados')
  })

  it('takes the first entry when Next hands over a repeated param', () => {
    expect(parseProfileTab(['pedidos', 'contatos'])).toBe('pedidos')
    expect(parseProfileTab([])).toBe('dados')
  })

  it('is case sensitive, matching the values written in the URL', () => {
    expect(parseProfileTab('Pedidos')).toBe('dados')
  })
})
