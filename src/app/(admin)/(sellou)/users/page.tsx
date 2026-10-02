import { AdminUsers } from '@/components/users'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { usersExcludeFields, usersFieldMapping } from '@/helpers/users-field-mapping'
import type { DefaultSearchParams } from '@/interfaces/default-search-params.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import type { User } from '@/interfaces/user.interface'
import { apiToFilterFields } from '@/utils/advanced-filter/filter-fields'
import { getPageParams } from '@/utils/get-page-params.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { serverFetch } from '@/utils/server-fetch.util'
import { Metadata } from 'next'

interface UsersPageProps {
  searchParams: DefaultSearchParams
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Usuários'
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = getPageParams({ searchParams, includeDateFilters: false })
  const url = `/user?${params.toString()}`

  const response = await serverFetch<PaginatedResponse<User>>(url, {
    method: 'GET'
  })

  if (isApiErrorResponse(response)) {
    throw new Error(response.message)
  }

  const { data: users, metadata } = response

  const filterFields = apiToFilterFields({
    data: users?.[0],
    enumReference: 'users',
    excludeFields: usersExcludeFields,
    fieldMappings: usersFieldMapping
  })

  return <AdminUsers users={users} metadata={metadata} filterFields={filterFields} />
}
