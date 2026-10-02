'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Segment } from '@/interfaces/segment.interface'
import { SegmentDto } from '@/types/dto/segment-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createSegmentAction(
  companyId: number,
  actionDto: SegmentDto
): Promise<CommonResponse<Segment> | ApiErrorResponse> {
  const response = await handleServerAction<Segment>({
    url: `/company/${companyId}/segments`,
    method: 'POST',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/segments`)

  return response
}
