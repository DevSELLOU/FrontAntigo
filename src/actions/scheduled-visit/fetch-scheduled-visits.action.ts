'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { ScheduledVisit } from '@/interfaces/scheduled-visit.interface'
import { handleServerAction } from '@/utils/server-action.util'

export async function fetchScheduledVisitsAction(
  companyId: number
): Promise<CommonResponse<ScheduledVisit[]> | ApiErrorResponse> {
  const response = await handleServerAction<ScheduledVisit[]>({
    url: `/company/${companyId}/routes-visits/scheduled-visits`,
    method: 'GET'
  })

  return response
}

export async function fetchMyScheduledVisitsAction(
  companyId: number
): Promise<CommonResponse<ScheduledVisit[]> | ApiErrorResponse> {
  const response = await handleServerAction<ScheduledVisit[]>({
    url: `/company/${companyId}/routes-visits/scheduled-visits/my`,
    method: 'GET'
  })

  return response
}
