'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Order } from '@/interfaces/order.interface'
import { OrderDto } from '@/types/dto/order-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export type CreateOrderActionDto = Omit<OrderDto, 'customerId' | 'paymentConditionId' | 'paymentMethodId' | 'discount' | 'programmedDate'> & {
  customerId: number
  paymentConditionId: number
  paymentMethodId: number
  discount: string
  programmedDate?: string
}

export async function createOrderAction(
  companyId: number,
  actionDto: CreateOrderActionDto,
  shopAccessToken?: string
): Promise<CommonResponse<Order> | ApiErrorResponse> {
  const response = await handleServerAction<Order>({
    url: `/company/${companyId}/orders`,
    method: 'POST',
    body: actionDto,
    shopAccessToken
  })

  revalidateTag(`/company/${companyId}/orders`)

  return response
}
