'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { RequestShopAccessDto } from '@/types/dto/request-shop-access-dto'
import { handleServerAction } from '@/utils/server-action.util'

export async function requestAccessAction(
  companyId: number,
  actionDto: RequestShopAccessDto
): Promise<CommonResponse<any> | ApiErrorResponse> {
  return handleServerAction({
    url: `/auth/company/${companyId}/access-request`,
    method: 'POST',
    body: actionDto
  })
}
