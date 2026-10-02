'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { SubSegment } from '@/interfaces/sub-segment.interface'
import { SubSegmentDto } from '@/types/dto/sub-segment-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createSubSegmentAction(
  companyId: number,
  segmentId: number,
  actionDto: SubSegmentDto
): Promise<CommonResponse<SubSegment> | ApiErrorResponse> {
  const response = await handleServerAction<SubSegment>({
    url: `/company/${companyId}/segments/${segmentId}/sub-segments`,
    method: 'POST',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/sub-segments/${segmentId}`)

  return response
}
