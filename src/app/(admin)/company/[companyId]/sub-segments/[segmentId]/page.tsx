import { CompanySubSegments } from '@/components/sub-segments'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { defaultExcludeFields } from '@/constants/advanced-filter'
import { DefaultSearchParams } from '@/interfaces/default-search-params.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { Segment } from '@/interfaces/segment.interface'
import { SubSegment } from '@/interfaces/sub-segment.interface'
import { apiToFilterFields } from '@/utils/advanced-filter/filter-fields'
import { fetchData } from '@/utils/fetch-data'
import { getPageParams } from '@/utils/get-page-params.util'
import { Metadata } from 'next'

interface PageProps {
  searchParams: DefaultSearchParams
  params: {
    companyId: number
    segmentId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Subsegmentos'
}

export default async function SubSegmentsPage({ searchParams, params }: PageProps) {
  const { companyId, segmentId } = params
  const pageParams = getPageParams({ searchParams, includeDateFilters: false })

  const subSegmentsUrl = `/company/${companyId}/segments/${segmentId}/sub-segments?${pageParams}`
  const segmentsUrl = `/company/${companyId}/segments`

  const [subSegmentsResponse, segmentsResponse] = await Promise.all([
    fetchData<PaginatedResponse<SubSegment>>(subSegmentsUrl, 'Falha ao buscar subsegmentos.'),
    fetchData<PaginatedResponse<Segment>>(segmentsUrl, 'Falha ao buscar segmentos.')
  ])

  const { data: subSegments, metadata } = subSegmentsResponse
  const { data: segments } = segmentsResponse

  const segment = segments.find(segment => segment.id === Number(segmentId))

  if (!segment) {
    throw new Error('Nenhum segmento encontrada para o ID informado.')
  }

  const filterFields = apiToFilterFields({
    data: subSegments?.[0],
    excludeFields: [...defaultExcludeFields, 'segment', 'segmentId'],
    fieldMappings: {
      name: {
        type: 'text',
        label: 'Nome'
      }
    }
  })

  return (
    <CompanySubSegments
      subSegments={subSegments}
      segment={segment}
      metadata={metadata}
      filterFields={filterFields}
      companyId={companyId}
    />
  )
}
