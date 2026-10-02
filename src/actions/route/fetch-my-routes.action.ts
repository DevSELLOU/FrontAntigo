'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { Route } from '@/interfaces/route.interface'
import { handleServerAction } from '@/utils/server-action.util'

export async function fetchMyRoutesAction(
  companyId: number
): Promise<CommonResponse<Route[]> | ApiErrorResponse> {
  const response = await handleServerAction<Route[]>({
    url: `/company/${companyId}/routes-visits/routes/my-routes`,
    method: 'GET'
  })

  return response
}

export async function fetchRoutesAction(
  companyId: number
): Promise<CommonResponse<Route[]> | ApiErrorResponse> {
  const response = await handleServerAction<Route[]>({
    url: `/company/${companyId}/routes-visits/routes`,
    method: 'GET'
  })

  return response
}