'use client'

import { ManagementListTab } from '@/components/management/management-list-tab'
import { CreateSegmentModal } from '@/components/segments/create-segment-modal'
import { SegmentTable } from '@/components/segments/segment-table'
import type { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { Segment } from '@/interfaces/segment.interface'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'
import { Network } from 'lucide-react'

interface SegmentsTabProps {
  segments: Segment[]
  metadata: PaginatedResponseMetadata
  filterFields: FilterField[]
  companyId: number
  isAdministrator: boolean
}

export function SegmentsTab({ segments, metadata, filterFields, companyId, isAdministrator }: SegmentsTabProps) {
  return (
    <ManagementListTab
      tab='segmentos'
      isAdministrator={isAdministrator}
      companyId={companyId}
      icon={<Network className='h-5 w-5' />}
      title='Segmentos'
      description='Classifique os clientes por segmento e subsegmento de atuação.'
      filterFields={filterFields}
      filterTitle='Filtrar segmentos'
      filterSubtitle='Refine por nome e descrição.'
      createLabel='Novo segmento'
      renderCreateModal={close => <CreateSegmentModal open onClose={close} companyId={companyId} />}
      metadata={metadata}
    >
      <SegmentTable segments={segments} companyId={companyId} />
    </ManagementListTab>
  )
}
