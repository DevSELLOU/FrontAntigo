import { DefaultSearchParams } from '@/interfaces/default-search-params.interface'

export function getPageParams({
  searchParams,
  includeDateFilters
}: {
  searchParams: DefaultSearchParams
  includeDateFilters?: boolean
}) {
  const currentYear = new Date().getFullYear()

  let filtersObj: Record<string, unknown> = {}
  const existingFilters = searchParams?.filters
  if (existingFilters) {
    try {
      filtersObj = JSON.parse(existingFilters)
    } catch {
      filtersObj = {}
    }
  }

  if (includeDateFilters === true) {
    if (!filtersObj.year) filtersObj.year = currentYear
    if (filtersObj.month === undefined) filtersObj.month = 0
  }

  const pageParams = new URLSearchParams({
    page: searchParams?.page || '1',
    limit: searchParams?.limit || '10',
    query: searchParams?.query || '',
    filters: JSON.stringify(filtersObj),
    sort: searchParams?.sort || ''
  })

  return pageParams
}
