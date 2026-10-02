'use client'

import { Pagination } from '@/components/admin/pagination'
import { AdvancedFilterDrawer } from '@/components/shared/advanced-filter-drawer'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { useDelayedUrlSearch } from '@/hooks/use-delayed-url-search'
import type { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import type { PriceTable as PriceTableType } from '@/interfaces/price-table.interface'
import { countActiveFilters } from '@/utils/advanced-filter/count-active-filters'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'
import { Tags } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { CreatePriceTableModal } from './create-price-table-modal'
import { PriceTable } from './price-table'

interface CompanyPriceTablesProps {
  priceTables: PriceTableType[]
  metadata: PaginatedResponseMetadata
  filterFields: FilterField[]
  companyId: number
  companyColor?: string | null
}

/**
 * Frame only. The pricing grid (`price-table.tsx`) and its rules editor keep every bit of their
 * behaviour — this screen is a real product feature, not a CRUD listing, so it stays on its own
 * route instead of being squeezed into a tab of the management hub.
 */
export function CompanyPriceTables({
  priceTables,
  metadata,
  filterFields,
  companyId,
  companyColor
}: CompanyPriceTablesProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { query, setQuery } = useDelayedUrlSearch()

  const filterCount = useMemo(() => countActiveFilters(searchParams), [searchParams])

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ListingPageHeader
        card
        icon={<Tags className='h-5 w-5' />}
        eyebrow='Gerenciamento'
        title='Tabelas de preço'
        description='Monte tabelas por cliente ou região e ajuste o preço de cada produto.'
        searchValue={query}
        onSearch={setQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={filterCount}
        showViewSelector={false}
        primaryAction={{ label: 'Nova tabela', onClick: () => setIsCreateOpen(true) }}
      />

      <AdvancedFilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        fields={filterFields}
        title='Filtrar tabelas de preço'
        subtitle='Refine por nome e situação.'
      />

      <div className='flex flex-col gap-4 min-w-0'>
        <PriceTable companyId={companyId} priceTables={priceTables} companyColor={companyColor} />
        <Pagination metadata={metadata} />
      </div>

      {isCreateOpen && (
        <CreatePriceTableModal
          open
          onClose={() => setIsCreateOpen(false)}
          companyId={companyId}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
