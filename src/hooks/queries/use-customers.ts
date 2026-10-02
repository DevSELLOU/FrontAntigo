import { Customer } from '@/interfaces/customer.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { queryClient, queryKeys } from '@/lib/query-client'
import { clientFetch } from '@/utils/client-fetch.util'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface UseCustomersOptions {
  companyId: number
  page?: number
  limit?: number
  search?: string
  segmentId?: number
}

// Hook to fetch customers list with pagination
export function useCustomers({ companyId, page = 1, limit = 50, search, segmentId }: UseCustomersOptions) {
  return useQuery({
    queryKey: [...queryKeys.customers.lists(companyId), { page, limit, search, segmentId }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (search) params.append('search', search)
      if (segmentId) params.append('segmentId', segmentId.toString())

      const response = await clientFetch<PaginatedResponse<Customer>>(
        `/company/${companyId}/customers?${params.toString()}`,
        { method: 'GET' }
      )
      return response
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - customers don't change as frequently
    gcTime: 5 * 60 * 60 * 1000, // 5 hours
  })
}

// Hook to fetch a single customer
export function useCustomer(companyId: number, customerId: number) {
  return useQuery({
    queryKey: queryKeys.customers.detail(companyId, customerId),
    queryFn: async () => {
      const response = await clientFetch<Customer>(
        `/company/${companyId}/customers/${customerId}`,
        { method: 'GET' }
      )
      return response
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours
    gcTime: 5 * 60 * 60 * 1000, // 5 hours
    enabled: !!customerId,
  })
}

// Hook for customer search (for order creation).
// The API route is `customer` (singular) and the search param is `query` —
// `customers?search=` silently 404s and empties the picker.
export function useCustomerSearch(companyId: number, searchQuery: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.customers.search(companyId, searchQuery),
    queryFn: async () => {
      const params = new URLSearchParams({
        query: searchQuery,
        limit: '20',
        filters: JSON.stringify({ status: { eq: 'ACTIVE' } })
      })

      const response = await clientFetch<PaginatedResponse<Customer>>(
        `/company/${companyId}/customer?${params.toString()}`,
        { method: 'GET' }
      )
      return response
    },
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    enabled: enabled && searchQuery.length >= 2, // Only search if query has 2+ characters
  })
}

// Hook to prefetch customers
export function prefetchCustomers(companyId: number) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.customers.lists(companyId),
    queryFn: async () => {
      const response = await clientFetch<PaginatedResponse<Customer>>(
        `/company/${companyId}/customers?page=1&limit=50`,
        { method: 'GET' }
      )
      return response
    },
    staleTime: 4 * 60 * 60 * 1000,
    gcTime: 5 * 60 * 60 * 1000,
  })
}

// Hook to invalidate customers cache
export function useInvalidateCustomers() {
  const queryClient = useQueryClient()

  return {
    invalidateCustomers: (companyId: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists(companyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
    },
    invalidateCustomer: (companyId: number, customerId: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(companyId, customerId) })
    },
    removeCustomerFromCache: (companyId: number, customerId: number) => {
      queryClient.removeQueries({ queryKey: queryKeys.customers.detail(companyId, customerId) })
    },
  }
}
