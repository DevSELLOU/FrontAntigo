'use server'

import type { Order } from '@/interfaces/order.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { handleServerAction } from '@/utils/server-action.util'

export async function fetchOrdersByCustomerAction(
  companyId: number,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Order[]; message: string } | { message: string; statusCode?: number }> {
  const filters = JSON.stringify({ customerId: { eq: customerId } })
  const sort = JSON.stringify({ createdAt: 'desc' })

  const response = await handleServerAction<PaginatedResponse<Order>>({
    url: `/company/${companyId}/orders?filters=${encodeURIComponent(filters)}&sort=${encodeURIComponent(sort)}&page=${page}&limit=${limit}`,
    method: 'GET'
  })

  if ('data' in response && response.data) {
    return {
      data: response.data.data || [],
      message: response.message
    }
  }

  return {
    message: 'message' in response ? response.message : 'Erro desconhecido',
    statusCode: 'statusCode' in response ? response.statusCode : 500
  }
}
