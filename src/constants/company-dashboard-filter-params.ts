/** The 8 URL params `DashboardFilters` reads/writes and the backend's `DashboardQueryPipe`
 * accepts — single source shared by the export request (which needs to mirror the active
 * filter) and the filter summary (which needs to know what's active). */
export const COMPANY_DASHBOARD_FILTER_PARAMS = [
  'months',
  'years',
  'state',
  'cities',
  'products',
  'customers',
  'sellers',
  'managers'
] as const

export function buildCompanyDashboardFilterQuery(searchParams: URLSearchParams): URLSearchParams {
  const query = new URLSearchParams()
  for (const key of COMPANY_DASHBOARD_FILTER_PARAMS) {
    const value = searchParams.get(key)
    if (value) query.set(key, value)
  }
  return query
}
