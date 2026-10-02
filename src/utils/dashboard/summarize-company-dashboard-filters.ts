import { COMPANY_DASHBOARD_FILTER_PARAMS } from '@/constants/company-dashboard-filter-params'

export interface ActiveFilterSummaryItem {
  key: string
  label: string
}

function countValues(value: string): number {
  return value.split(',').filter(Boolean).length
}

const LABELS: Record<string, { singular: string; plural: string }> = {
  months: { singular: 'mês', plural: 'meses' },
  years: { singular: 'ano', plural: 'anos' },
  state: { singular: 'estado', plural: 'estados' },
  cities: { singular: 'cidade', plural: 'cidades' },
  products: { singular: 'produto', plural: 'produtos' },
  customers: { singular: 'cliente', plural: 'clientes' },
  sellers: { singular: 'vendedor', plural: 'vendedores' },
  managers: { singular: 'gerente', plural: 'gerentes' }
}

/** Reads the same 8 URL params `DashboardFilters` writes and turns them into the "2 estados" /
 * "3 cidades" style summary — driven by the URL (what's actually applied), not the drawer's
 * pending selection. Single source for both the filter button's count badge and the summary
 * strip below the header. */
export function summarizeCompanyDashboardFilters(searchParams: URLSearchParams): ActiveFilterSummaryItem[] {
  const items: ActiveFilterSummaryItem[] = []

  for (const key of COMPANY_DASHBOARD_FILTER_PARAMS) {
    const value = searchParams.get(key)
    if (!value) continue

    const count = countValues(value)
    if (count === 0) continue

    const label = LABELS[key]
    items.push({ key, label: `${count} ${count === 1 ? label.singular : label.plural}` })
  }

  return items
}
