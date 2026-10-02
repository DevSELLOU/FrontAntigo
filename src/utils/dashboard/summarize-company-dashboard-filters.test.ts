import { describe, expect, it } from 'vitest'
import { summarizeCompanyDashboardFilters } from './summarize-company-dashboard-filters'

describe('summarizeCompanyDashboardFilters', () => {
  it('returns nothing when no filter param is present', () => {
    expect(summarizeCompanyDashboardFilters(new URLSearchParams('tab=gestao'))).toEqual([])
  })

  it('counts comma-separated values and picks singular/plural correctly', () => {
    const params = new URLSearchParams('state=SP,RJ,MG&cities=Campinas')
    expect(summarizeCompanyDashboardFilters(params)).toEqual([
      { key: 'state', label: '3 estados' },
      { key: 'cities', label: '1 cidade' }
    ])
  })

  it('covers all 8 filter params, in a stable order', () => {
    const params = new URLSearchParams(
      'months=2026-01,2026-02&years=2025&state=SP&cities=Campinas,Sorocaba&products=Produto+A&customers=1,2,3&sellers=4&managers=5'
    )
    expect(summarizeCompanyDashboardFilters(params).map(item => item.key)).toEqual([
      'months',
      'years',
      'state',
      'cities',
      'products',
      'customers',
      'sellers',
      'managers'
    ])
  })

  it('ignores an empty string value', () => {
    expect(summarizeCompanyDashboardFilters(new URLSearchParams('state='))).toEqual([])
  })
})
