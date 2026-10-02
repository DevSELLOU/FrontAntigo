'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { ScheduledVisit } from '@/interfaces/scheduled-visit.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updateScheduledVisitAction(
  companyId: number,
  visitId: number,
  body: { scheduledDate?: string; notes?: string }
): Promise<CommonResponse<ScheduledVisit> | ApiErrorResponse> {
  const response = await handleServerAction<ScheduledVisit>({
    url: `/company/${companyId}/routes-visits/scheduled-visits/${visitId}`,
    method: 'PATCH',
    body
  })

  revalidateTag(`/company/${companyId}/routes-visits/scheduled-visits`)

  return response
}
