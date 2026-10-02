'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { VisitRecord } from '@/interfaces/visit-record.interface'
import { handleServerAction } from '@/utils/server-action.util'

export async function fetchVisitHistoryAction(
  companyId: number
): Promise<CommonResponse<VisitRecord[]> | ApiErrorResponse> {
  const response = await handleServerAction<VisitRecord[]>({
    url: `/company/${companyId}/routes-visits/visit-records/history`,
    method: 'GET'
  })

  return response
}
