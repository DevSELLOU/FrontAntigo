'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Order } from '@/interfaces/order.interface'
import { UpdateOrderValueDto } from '@/types/dto/update-order-value-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updateOrderValueAction(
  companyId: number,
  orderId: number,
  actionDto: UpdateOrderValueDto
): Promise<CommonResponse<Order> | ApiErrorResponse> {
  const response = await handleServerAction<Order>({
    url: `/company/${companyId}/orders/${orderId}/amount-paid`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/orders`)

  return response
}
