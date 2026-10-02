'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Order } from '@/interfaces/order.interface'
import { UpdateOrderStatusDto } from '@/types/dto/update-order-status-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updateOrderStatusAction(
  companyId: number,
  orderId: number,
  actionDto: UpdateOrderStatusDto & { partialInvoicing?: { productId: number; quantity: number }[] }
): Promise<CommonResponse<{ originalOrder: Order; newOrder?: Order }> | ApiErrorResponse> {
  const response = await handleServerAction<{ originalOrder: Order; newOrder?: Order }>({
    url: `/company/${companyId}/orders/${orderId}/status`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/orders`)

  return response
}
