import { CompanyCustomers } from '@/components/customers'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { Customer } from '@/interfaces/customer.interface'
import { DefaultSearchParams } from '@/interfaces/default-search-params.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { Segment } from '@/interfaces/segment.interface'
import { CustomerWrapper } from '@/types/customer-wrapper.type'
import { parseCustomerFilters, readCustomerStatusFilter } from '@/utils/customers/status-filter.util'
import { fetchData } from '@/utils/fetch-data'
import { Metadata } from 'next'

interface PageProps {
  searchParams: DefaultSearchParams
  params: {
    companyId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Clientes'
}

/** `null` means the count could not be loaded — the status capsule then shows no number at all. */
export interface StatusCounts {
  all: number | null
  active: number | null
  inactive: number | null
  defaulting: number | null
}

/** Everything the counts must agree with: the same search text and the same non-status filters. */
interface CountScope {
  query: string
  filters: Record<string, unknown>
}

function buildPageParams(searchParams: DefaultSearchParams, statusFilter: CustomerStatus | null): string {
  const filtersObj = parseCustomerFilters(searchParams?.filters)

  if (statusFilter) {
    filtersObj.status = { eq: statusFilter }
  } else {
    delete filtersObj.status
  }

  const pageParams = new URLSearchParams({
    page: searchParams?.page || '1',
    limit: searchParams?.limit || '10',
    query: searchParams?.query || '',
    filters: JSON.stringify(filtersObj),
    sort: searchParams?.sort || ''
  })

  return pageParams.toString()
}

function parseTotal(total: string | undefined): number | null {
  const parsed = parseInt(total ?? '', 10)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Count of customers in one status, honouring the search text and every other active filter —
 * without that scoping the tabs claimed "Todos 250" while three rows were on screen.
 *
 * Returns `null` instead of throwing: `fetchData` rejects on any API failure, and these counts
 * are decoration. Before, a single failing count took the whole page down with a 500.
 */
async function fetchStatusCount(
  baseUrl: string,
  status: CustomerStatus | null,
  { query, filters }: CountScope
): Promise<number | null> {
  const scopedFilters = status ? { ...filters, status: { eq: status } } : filters

  const params = new URLSearchParams({ limit: '1', page: '1' })
  if (query) params.set('query', query)
  if (Object.keys(scopedFilters).length > 0) params.set('filters', JSON.stringify(scopedFilters))

  try {
    const response = await fetchData<PaginatedResponse<Customer>>(
      `${baseUrl}/customer?${params.toString()}`,
      'Falha ao buscar contagem.'
    )
    return parseTotal(response.metadata?.total)
  } catch {
    return null
  }
}

export default async function CustomersPage({ searchParams, params }: PageProps) {
  const { companyId } = params

  const baseUrl = `/company/${companyId}`
  // Only segments are needed to *render* the listing (cards and table print the segment name).
  // Payment conditions, payment methods and company users exist solely to fill the create form,
  // so they load when that modal opens — see `CreateCustomerModalLoader`.
  const segmentsUrl = `${baseUrl}/segments`

  const statusFilter = readCustomerStatusFilter(searchParams?.filters)
  const activeStatus = statusFilter === 'ALL' ? null : statusFilter

  const customersPageParams = buildPageParams(searchParams, activeStatus)
  const customersUrl = `${baseUrl}/customer?${customersPageParams}`

  const [customersResponse, segmentsResponse] = await Promise.all([
    fetchData<PaginatedResponse<Customer>>(customersUrl, 'Falha ao buscar clientes.'),
    fetchData<PaginatedResponse<Segment>>(segmentsUrl, 'Falha ao buscar segmentos.')
  ])

  const nonStatusFilters = parseCustomerFilters(searchParams?.filters)
  delete nonStatusFilters.status

  const countScope: CountScope = { query: searchParams?.query || '', filters: nonStatusFilters }

  // With no status selected the listing request already asked for exactly the "Todos" set, so its
  // own metadata.total is the count — one request less in the common case.
  const [fetchedAllCount, activeCount, inactiveCount, defaultingCount] = await Promise.all([
    activeStatus ? fetchStatusCount(baseUrl, null, countScope) : Promise.resolve(null),
    fetchStatusCount(baseUrl, CustomerStatus.Active, countScope),
    fetchStatusCount(baseUrl, CustomerStatus.Inactive, countScope),
    fetchStatusCount(baseUrl, CustomerStatus.Defaulting, countScope)
  ])

  const { data: customers, metadata } = customersResponse
  const { data: segments } = segmentsResponse

  const customerWrapper: CustomerWrapper = {
    companyId,
    customers,
    segments,
    // Deliberately empty here: the create form loads these itself when it opens.
    paymentConditions: [],
    paymentMethods: [],
    users: []
  }

  const statusCounts: StatusCounts = {
    all: activeStatus ? fetchedAllCount : parseTotal(metadata?.total),
    active: activeCount,
    inactive: inactiveCount,
    defaulting: defaultingCount
  }

  return <CompanyCustomers customerWrapper={customerWrapper} metadata={metadata} statusCounts={statusCounts} />
}
