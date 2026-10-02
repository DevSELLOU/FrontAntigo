import { AdminCompanies } from '@/components/companies'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { defaultExcludeFields } from '@/constants/advanced-filter'
import { companiesFieldMapping } from '@/helpers/companies-field-mapping'
import { Company } from '@/interfaces/company.interface'
import type { DefaultSearchParams } from '@/interfaces/default-search-params.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { apiToFilterFields } from '@/utils/advanced-filter/filter-fields'
import { getPageParams } from '@/utils/get-page-params.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { serverFetch } from '@/utils/server-fetch.util'
import { Metadata } from 'next'

interface CompaniesPageProps {
  searchParams: DefaultSearchParams
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Empresas'
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = getPageParams({ searchParams, includeDateFilters: false })
  const url = `/company?${params.toString()}`

  const response = await serverFetch<PaginatedResponse<Company>>(url, {
    method: 'GET'
  })

  if (isApiErrorResponse(response)) {
    throw new Error(response.message)
  }

  const { data: companies, metadata } = response

  const filterFields = apiToFilterFields({
    data: companies?.[0],
    excludeFields: defaultExcludeFields,
    fieldMappings: companiesFieldMapping
  })

  return <AdminCompanies companies={companies} metadata={metadata} filterFields={filterFields} />
}
