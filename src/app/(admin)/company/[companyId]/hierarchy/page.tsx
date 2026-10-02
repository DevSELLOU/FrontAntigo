import { CompanyUserHierarchy } from '@/components/user-hierarchy'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { DefaultSearchParams } from '@/interfaces/default-search-params.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import type { UserHierarchy } from '@/interfaces/user-hierarchy.interface'
import type { User } from '@/interfaces/user.interface'
import { getPageParams } from '@/utils/get-page-params.util'
import { serverFetch } from '@/utils/server-fetch.util'
import { Metadata } from 'next'

interface PageProps {
  searchParams: DefaultSearchParams
  params: {
    companyId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Hierarquia'
}

export default async function HierarchyPage({ searchParams, params }: PageProps) {
  const pageParams = getPageParams({ searchParams, includeDateFilters: false })
  const userHierarchyUrl = `/user-hierarchy/company/${params.companyId}/tree?${pageParams.toString()}`
  const userUrl = `/company/${params.companyId}/users?limit=1000`

  // The tree endpoint answers with the roots array itself, not a paginated envelope.
  const [hierarchy, usersResponse] = await Promise.all([
    serverFetch<UserHierarchy[]>(userHierarchyUrl, { method: 'GET' }),
    serverFetch<PaginatedResponse<User>>(userUrl, { method: 'GET' })
  ])

  return (
    <CompanyUserHierarchy
      hierarchyData={hierarchy ?? []}
      usersData={usersResponse.data}
      companyId={params.companyId}
    />
  )
}
