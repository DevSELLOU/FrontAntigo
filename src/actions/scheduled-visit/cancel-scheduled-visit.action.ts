'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function cancelScheduledVisitAction(
  companyId: number,
  visitId: number
): Promise<CommonResponse<{ message: string }> | ApiErrorResponse> {
  const response = await handleServerAction<{ message: string }>({
    url: `/company/${companyId}/routes-visits/scheduled-visits/${visitId}`,
    method: 'DELETE'
  })

  revalidateTag(`/company/${companyId}/routes-visits/scheduled-visits`)

  return response
}
