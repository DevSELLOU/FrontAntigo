'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { OrderSetup } from '@/interfaces/order-setup.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { handleServerAction } from '@/utils/server-action.util'

export async function getOrderSetupAction(
  companyId: number,
  shopAccessToken?: string
): Promise<CommonResponse<OrderSetup> | ApiErrorResponse> {
  const response = await handleServerAction<PaginatedResponse<OrderSetup>>({
    url: `/company/${companyId}/order-setup`,
    method: 'GET',
    shopAccessToken
  })

  if ('data' in response && response.data?.data?.length > 0) {
    return {
      message: response.message,
      data: response.data.data[0]
    }
  }

  // Return error if no data found or if it was already an error
  return response as ApiErrorResponse
}

export async function createOrderSetupAction(
  companyId: number,
  data: { minDays: number; maxDays: number }
): Promise<CommonResponse<OrderSetup> | ApiErrorResponse> {
  const response = await handleServerAction<OrderSetup>({
    url: `/company/${companyId}/order-setup`,
    method: 'POST',
    body: data
  })

  return response
}

export async function updateOrderSetupAction(
  companyId: number,
  orderSetupId: number,
  data: { minDays: number; maxDays: number }
): Promise<CommonResponse<OrderSetup> | ApiErrorResponse> {
  const response = await handleServerAction<OrderSetup>({
    url: `/company/${companyId}/order-setup/${orderSetupId}`,
    method: 'PATCH',
    body: data
  })

  return response
}
