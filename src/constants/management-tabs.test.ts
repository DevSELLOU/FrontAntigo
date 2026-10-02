import { describe, expect, it } from 'vitest'
import { getVisibleManagementTabs, MANAGEMENT_TABS, resolveManagementTab } from './management-tabs'

describe('getVisibleManagementTabs', () => {
  it('gives administrators every tab', () => {
    expect(getVisibleManagementTabs(true)).toHaveLength(MANAGEMENT_TABS.length)
  })

  // Preferências stopped being everyone's tab when the change-password card moved to `/profile`:
  // all that is left in the hub is company configuration.
  it('gives everyone else nothing, because the whole hub is company configuration', () => {
    expect(getVisibleManagementTabs(false)).toEqual([])
  })
})

describe('resolveManagementTab', () => {
  it('keeps a valid tab for an administrator', () => {
    expect(resolveManagementTab('segmentos', true)).toBe('segmentos')
  })

  it('falls back to the first visible tab when the param is missing', () => {
    expect(resolveManagementTab(undefined, true)).toBe('categorias')
  })

  it('falls back when the param is not a known tab', () => {
    expect(resolveManagementTab('does-not-exist', true)).toBe('categorias')
  })

  // The security-relevant case: this is what stops an admin-only fetch from ever being issued for
  // a sales rep that hand-types the URL. The caller redirects them to their own profile instead.
  it('answers null for a non-administrator, whatever they ask for', () => {
    expect(resolveManagementTab(undefined, false)).toBeNull()
    expect(resolveManagementTab('segmentos', false)).toBeNull()
    expect(resolveManagementTab('preferencias', false)).toBeNull()
  })
})
