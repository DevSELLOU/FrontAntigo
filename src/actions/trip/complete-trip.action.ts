'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { Trip } from '@/interfaces/trip.interface'
import type { CompleteTripDto } from '@/types/dto/trip-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function completeTripAction(
  companyId: number,
  tripId: number,
  actionDto: CompleteTripDto
): Promise<CommonResponse<Trip> | ApiErrorResponse> {
  const response = await handleServerAction<Trip>({
    url: `/company/${companyId}/routes-visits/trips/${tripId}/complete`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/routes-visits/trips`)

  return response
}
