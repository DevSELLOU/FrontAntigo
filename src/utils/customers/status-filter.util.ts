import { CustomerStatus } from '@/enums/customer-status.enum'

/** `ALL` is the "no status filter" pseudo-value used by the status capsule above the listing. */
export type CustomerStatusFilter = 'ALL' | CustomerStatus

const CUSTOMER_STATUS_VALUES = Object.values(CustomerStatus) as string[]

/**
 * Parses the `filters` URL param into a plain object, treating missing/malformed/non-object
 * values as "no filters". Exported because the server page needs the conditions *other than*
 * status to scope its per-status counts.
 */
export function parseCustomerFilters(filtersParam: string | null | undefined): Record<string, unknown> {
  if (!filtersParam) return {}

  try {
    const parsed = JSON.parse(filtersParam)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as Record<string, unknown>
  } catch {
    return {}
  }
}

/**
 * Reads the active customer status out of the `filters` URL param, which carries the whole
 * `AdvancedFilter` object (`{"status":{"eq":"ACTIVE"},...}`). Anything malformed, missing or not
 * a known `CustomerStatus` reads as `ALL` — the same forgiving behaviour the three inlined
 * try/catch blocks had before (listing container ×2 and the server page).
 */
export function readCustomerStatusFilter(filtersParam: string | null | undefined): CustomerStatusFilter {
  const filters = parseCustomerFilters(filtersParam)
  const status = (filters.status as { eq?: unknown } | undefined)?.eq

  if (typeof status === 'string' && CUSTOMER_STATUS_VALUES.includes(status)) {
    return status as CustomerStatus
  }

  return 'ALL'
}

/**
 * Returns the query string for switching the status capsule, merging into (or removing from) the
 * existing `filters` object so unrelated advanced-filter conditions survive the switch.
 *
 * Two details that the previous inline version got wrong: selecting "Todos" used to leave an
 * empty `filters={}` in the URL (visible junk, and enough to make a naive "has filters?" check
 * lie), so the param is dropped entirely when nothing is left; and `page` is always reset to 1,
 * otherwise switching status while on page 3 can land on a page past the filtered total.
 */
export function buildCustomerStatusSearch(searchParams: URLSearchParams, status: CustomerStatusFilter): string {
  const params = new URLSearchParams(searchParams)
  const filters = parseCustomerFilters(params.get('filters'))

  if (status === 'ALL') {
    delete filters.status
  } else {
    filters.status = { eq: status }
  }

  if (Object.keys(filters).length === 0) {
    params.delete('filters')
  } else {
    params.set('filters', JSON.stringify(filters))
  }

  params.set('page', '1')

  return params.toString()
}
