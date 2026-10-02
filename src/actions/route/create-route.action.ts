'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Route } from '@/interfaces/route.interface'
import { RouteDto } from '@/types/dto/route-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createRouteAction(
  companyId: number,
  actionDto: RouteDto
): Promise<CommonResponse<Route> | ApiErrorResponse> {
  const response = await handleServerAction<Route>({
    url: `/company/${companyId}/routes-visits/routes`,
    method: 'POST',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/routes`)

  return response
}