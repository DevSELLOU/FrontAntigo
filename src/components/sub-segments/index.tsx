'use client'

import { Pagination } from '@/components/admin/pagination'
import { AdvancedFilterDrawer } from '@/components/shared/advanced-filter-drawer'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { Button } from '@/components/ui/button'
import { useDelayedUrlSearch } from '@/hooks/use-delayed-url-search'
import type { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { Segment } from '@/interfaces/segment.interface'
import { SubSegment } from '@/interfaces/sub-segment.interface'
import { countActiveFilters } from '@/utils/advanced-filter/count-active-filters'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'
import { ArrowLeft, Layers } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { CreateSubSegmentModal } from './create-sub-segment-modal'
import { SubSegmentTable } from './sub-segment-table'

interface CompanySubSegmentsProps {
  subSegments: SubSegment[]
  segment: Segment
  metadata: PaginatedResponseMetadata
  filterFields: FilterField[]
  companyId: number
}

export function CompanySubSegments({
  subSegments,
  segment,
  metadata,
  filterFields,
  companyId
}: CompanySubSegmentsProps) {
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
        icon={<Layers className='h-5 w-5' />}
        eyebrow='Gerenciamento'
        title='Subsegmentos'
        description={`Detalhe o segmento ${segment.name} em subsegmentos.`}
        searchValue={query}
        onSearch={setQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={filterCount}
        showViewSelector={false}
        secondaryActions={
          <Button
            variant='secondary'
            className='gap-2'
            onClick={() => router.push(`/company/${companyId}/settings?tab=segmentos`)}
          >
            <ArrowLeft className='h-4 w-4' />
            Segmentos
          </Button>
        }
        primaryAction={{ label: 'Novo subsegmento', onClick: () => setIsCreateOpen(true) }}
      />

      <AdvancedFilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        fields={filterFields}
        title='Filtrar subsegmentos'
        subtitle='Refine por nome.'
      />

      <div className='flex flex-col gap-4 min-w-0'>
        <SubSegmentTable subSegments={subSegments} companyId={companyId} />
        <Pagination metadata={metadata} />
      </div>

      {isCreateOpen && (
        <CreateSubSegmentModal
          open
          onClose={() => setIsCreateOpen(false)}
          companyId={companyId}
          segmentId={segment.id}
        />
      )}
    </div>
  )
}
