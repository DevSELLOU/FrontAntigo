'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { Trip } from '@/interfaces/trip.interface'
import type { CreateTripDto } from '@/types/dto/trip-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createTripAction(
  companyId: number,
  actionDto: CreateTripDto
): Promise<CommonResponse<Trip> | ApiErrorResponse> {
  const response = await handleServerAction<Trip>({
    url: `/company/${companyId}/routes-visits/trips`,
    method: 'POST',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/routes-visits/trips/my-trips`)

  return response
}