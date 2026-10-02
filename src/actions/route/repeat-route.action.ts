'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { Route } from '@/interfaces/route.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function repeatRouteAction(
  companyId: number,
  routeId: number,
  body: { scheduledDate: string }
): Promise<CommonResponse<Route> | ApiErrorResponse> {
  const response = await handleServerAction<Route>({
    url: `/company/${companyId}/routes-visits/routes/${routeId}/repeat`,
    method: 'POST',
    body
  })

  revalidateTag(`/company/${companyId}/routes`)

  return response
}
