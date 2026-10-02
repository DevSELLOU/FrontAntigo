'use client'

import { Pagination } from '@/components/admin/pagination'
import { AdvancedFilterDrawer } from '@/components/shared/advanced-filter-drawer'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { useDelayedUrlSearch } from '@/hooks/use-delayed-url-search'
import { AccessRequests } from '@/interfaces/access-requests.interface'
import type { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { countActiveFilters } from '@/utils/advanced-filter/count-active-filters'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'
import { UserRoundCheck } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AccessRequestTable } from './access-request-table'

interface CompanyAccessRequestsProps {
  accessRequests: AccessRequests[]
  metadata: PaginatedResponseMetadata
  filterFields: FilterField[]
  companyId: number
}

export function CompanyAccessRequests({
  accessRequests,
  metadata,
  filterFields,
  companyId
}: CompanyAccessRequestsProps) {
  const searchParams = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { query, setQuery } = useDelayedUrlSearch()

  const filterCount = useMemo(() => countActiveFilters(searchParams), [searchParams])

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      {/* No primary action on purpose: requests are created by visitors in the store, never here. */}
      <ListingPageHeader
        card
        icon={<UserRoundCheck className='h-5 w-5' />}
        eyebrow='Gerenciamento'
        title='Requisições de acesso'
        description='Analise quem pediu acesso à sua loja e vincule cada pedido a um cliente.'
        searchValue={query}
        onSearch={setQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={filterCount}
        showViewSelector={false}
      />

      <AdvancedFilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        fields={filterFields}
        title='Filtrar requisições'
        subtitle='Refine por empresa, solicitante e situação.'
      />

      <div className='flex flex-col gap-4 min-w-0'>
        <AccessRequestTable accessRequests={accessRequests} companyId={companyId} />
        <Pagination metadata={metadata} />
      </div>
    </div>
  )
}
