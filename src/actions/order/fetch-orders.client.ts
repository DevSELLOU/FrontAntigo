'use client'

import { clientFetch } from '@/utils/client-fetch.util'
import { Order } from '@/interfaces/order.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'

export async function fetchOrdersByStatus(
  companyId: number,
  statuses: string[]
): Promise<Order[]> {
  const allOrders: Order[] = []
  
  for (const status of statuses) {
    try {
      const response = await clientFetch<PaginatedResponse<Order>>(
        `/company/${companyId}/orders?status=${status}&limit=1000`,
        { method: 'GET' }
      )
      
      if (isApiErrorResponse(response)) {
        throw new Error(response.message)
      }
      
      allOrders.push(...response.data)
    } catch (error) {
      console.error(`Error fetching orders with status ${status}:`, error)
      throw error
    }
  }
  
  return allOrders
}
