import { describe, expect, it } from 'vitest'
import { resolveProfileHref } from './resolve-profile-href.util'

describe('resolveProfileHref', () => {
  it('keeps the user inside the company shell they are browsing', () => {
    expect(resolveProfileHref('/company/12/dashboard')).toBe('/company/12/profile')
    expect(resolveProfileHref('/company/12/orders/edit/99')).toBe('/company/12/profile')
    expect(resolveProfileHref('/company/12')).toBe('/company/12/profile')
  })

  it('uses the platform route outside the company shell', () => {
    expect(resolveProfileHref('/dashboard')).toBe('/profile')
    expect(resolveProfileHref('/companies')).toBe('/profile')
    expect(resolveProfileHref('/')).toBe('/profile')
  })

  // "/companies" must not be mistaken for a company id — it is the platform listing.
  it('does not treat a path that merely starts with "company" as a company shell', () => {
    expect(resolveProfileHref('/companies/12')).toBe('/profile')
  })
})
