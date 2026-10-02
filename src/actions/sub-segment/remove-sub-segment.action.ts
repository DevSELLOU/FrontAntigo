'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function removeSubSegmentAction(
  companyId: number,
  segmentId: number,
  subSegmentId: number
): Promise<CommonResponse<void> | ApiErrorResponse> {
  const response = await handleServerAction<void>({
    url: `/company/${companyId}/segments/${segmentId}/sub-segments/${subSegmentId}`,
    method: 'DELETE'
  })

  revalidateTag(`/company/${companyId}/sub-segments/${segmentId}`)

  return response
}
