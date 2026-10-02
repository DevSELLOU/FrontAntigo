import { Order } from '@/interfaces/order.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { queryClient, queryKeys } from '@/lib/query-client'
import { clientFetch } from '@/utils/client-fetch.util'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface UseOrdersOptions {
  companyId: number
  page?: number
  limit?: number
  status?: string
  customerId?: number
  startDate?: string
  endDate?: string
}

export function useOrders({ companyId, page = 1, limit = 20, status, customerId, startDate, endDate }: UseOrdersOptions) {
  return useQuery({
    queryKey: [...queryKeys.orders.lists(companyId), { page, limit, status, customerId, startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (status) params.append('status', status)
      if (customerId) params.append('customerId', customerId.toString())
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await clientFetch<PaginatedResponse<Order>>(
        `/company/${companyId}/orders?${params.toString()}`,
        { method: 'GET' }
      )
      return response
    },
    staleTime: 1 * 60 * 60 * 1000, // 1 hour - orders change very frequently
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  })
}

export function useOrder(companyId: number, orderId: number) {
  return useQuery({
    queryKey: queryKeys.orders.detail(companyId, orderId),
    queryFn: async () => {
      const response = await clientFetch<Order>(
        `/company/${companyId}/orders/${orderId}`,
        { method: 'GET' }
      )
      return response
    },
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    enabled: !!orderId,
  })
}

// Get recent orders (for quick access)
export function useRecentOrders(companyId: number, limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.orders.recent(companyId),
    queryFn: async () => {
      const response = await clientFetch<PaginatedResponse<Order>>(
        `/company/${companyId}/orders?page=1&limit=${limit}&sortBy=createdAt&sortOrder=desc`,
        { method: 'GET' }
      )
      return response
    },
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  })
}

// Hook to prefetch orders
export function prefetchOrders(companyId: number) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.orders.lists(companyId),
    queryFn: async () => {
      const response = await clientFetch<PaginatedResponse<Order>>(
        `/company/${companyId}/orders?page=1&limit=20`,
        { method: 'GET' }
      )
      return response
    },
    staleTime: 1 * 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  })
}

// Hook to invalidate orders cache
export function useInvalidateOrders() {
  const queryClient = useQueryClient()

  return {
    invalidateOrders: (companyId: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists(companyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.recent(companyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
    invalidateOrder: (companyId: number, orderId: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(companyId, orderId) })
    },
    removeOrderFromCache: (companyId: number, orderId: number) => {
      queryClient.removeQueries({ queryKey: queryKeys.orders.detail(companyId, orderId) })
    },
  }
}
