'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { ScheduledVisit } from '@/interfaces/scheduled-visit.interface'
import type { SkipCustomerDto } from '@/types/dto/trip-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function skipCustomerAction(
  companyId: number,
  tripId: number,
  actionDto: SkipCustomerDto
): Promise<CommonResponse<ScheduledVisit> | ApiErrorResponse> {
  const response = await handleServerAction<ScheduledVisit>({
    url: `/company/${companyId}/routes-visits/trips/${tripId}/skip-customer`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/routes-visits/trips/${tripId}`)

  return response
}
