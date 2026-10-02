'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { VisitRecord } from '@/interfaces/visit-record.interface'
import type { CheckInDto } from '@/types/dto/trip-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function checkInAction(
  companyId: number,
  tripId: number,
  actionDto: CheckInDto
): Promise<CommonResponse<VisitRecord> | ApiErrorResponse> {
  const response = await handleServerAction<VisitRecord>({
    url: `/company/${companyId}/routes-visits/trips/${tripId}/check-in`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/routes-visits/trips/my-trips`)

  return response
}