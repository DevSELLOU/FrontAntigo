'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { handleServerAction } from '@/utils/server-action.util'

export async function exportOrderAction(
  companyId: number,
  orderId: number
): Promise<CommonResponse<string> | ApiErrorResponse> {
  return handleServerAction<string>({
    url: `/company/${companyId}/orders/${orderId}/export`,
    method: 'GET'
  })
}
