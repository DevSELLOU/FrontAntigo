import { CompanyAccessRequests } from '@/components/access-requests'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { accessRequestExcludeFields, accessRequestsFieldMapping } from '@/helpers/access-requests-field-mapping'
import { AccessRequests } from '@/interfaces/access-requests.interface'
import { DefaultSearchParams } from '@/interfaces/default-search-params.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { apiToFilterFields } from '@/utils/advanced-filter/filter-fields'
import { getPageParams } from '@/utils/get-page-params.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { serverFetch } from '@/utils/server-fetch.util'
import { Metadata } from 'next'

interface PageProps {
  searchParams: DefaultSearchParams
  params: {
    companyId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Requisições de acesso'
}

export default async function AccessRequestsPage({ searchParams, params }: PageProps) {
  const pageParams = getPageParams({ searchParams, includeDateFilters: false })
  const url = `/company/${params.companyId}/access-requests?${pageParams}`

  const response = await serverFetch<PaginatedResponse<AccessRequests>>(url, {
    method: 'GET'
  })

  if (isApiErrorResponse(response)) {
    throw new Error(response.message)
  }

  const { data: accessRequests, metadata } = response

  const filterFields = apiToFilterFields({
    data: accessRequests?.[0],
    enumReference: 'access-requests',
    excludeFields: accessRequestExcludeFields,
    fieldMappings: accessRequestsFieldMapping
  })

  return (
    <CompanyAccessRequests
      accessRequests={accessRequests}
      metadata={metadata}
      filterFields={filterFields}
      companyId={params.companyId}
    />
  )
}
