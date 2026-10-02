import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { Product } from '@/interfaces/product.interface'
import { queryClient, queryKeys } from '@/lib/query-client'
import { clientFetch } from '@/utils/client-fetch.util'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface UseProductsOptions {
  companyId: number
  page?: number
  limit?: number
  search?: string
  categoryId?: number
}

export function useProducts({ companyId, page = 1, limit = 20, search, categoryId }: UseProductsOptions) {
  return useQuery({
    queryKey: [...queryKeys.products.lists(companyId), { page, limit, search, categoryId }],
    queryFn: async () => {
      console.log('[CACHE] Fetching products from API...')
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (search) params.append('search', search)
      if (categoryId) params.append('categoryId', categoryId.toString())

      const response = await clientFetch<PaginatedResponse<Product>>(
        `/company/${companyId}/products?${params.toString()}`,
        { method: 'GET' }
      )
      console.log('[CACHE] Products fetched successfully')
      return response
    },
    staleTime: 2 * 60 * 60 * 1000, // 2 hours - products change frequently
    gcTime: 3 * 60 * 60 * 1000, // 3 hours
  })
}

// Hook for product search (order form). Server-side so the picker isn't
// capped at whatever first page the page component preloaded — a catalog
// with hundreds of SKUs was previously unreachable past that first page.
export function useProductSearch(companyId: number, searchQuery: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.products.search(companyId, searchQuery),
    queryFn: async () => {
      const params = new URLSearchParams({
        query: searchQuery,
        limit: '30'
      })

      const response = await clientFetch<PaginatedResponse<Product>>(
        `/company/${companyId}/products?${params.toString()}`,
        { method: 'GET' }
      )
      return response
    },
    staleTime: 30 * 60 * 1000, // 30 min
    gcTime: 60 * 60 * 1000,
    enabled: enabled && searchQuery.length >= 2
  })
}

export function useProduct(companyId: number, productId: number) {
  return useQuery({
    queryKey: queryKeys.products.detail(companyId, productId),
    queryFn: async () => {
      const response = await clientFetch<Product>(
        `/company/${companyId}/products/${productId}`,
        { method: 'GET' }
      )
      return response
    },
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
    gcTime: 3 * 60 * 60 * 1000, // 3 hours
    enabled: !!productId,
  })
}

// Hook to prefetch products (call this before navigation)
export function prefetchProducts(companyId: number) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.products.lists(companyId),
    queryFn: async () => {
      const response = await clientFetch<PaginatedResponse<Product>>(
        `/company/${companyId}/products?page=1&limit=20`,
        { method: 'GET' }
      )
      return response
    },
    staleTime: 2 * 60 * 60 * 1000,
    gcTime: 3 * 60 * 60 * 1000,
  })
}

// Hook to invalidate products cache
export function useInvalidateProducts() {
  const queryClient = useQueryClient()

  return {
    invalidateProducts: (companyId: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists(companyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
    invalidateProduct: (companyId: number, productId: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(companyId, productId) })
    },
    removeProductFromCache: (companyId: number, productId: number) => {
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(companyId, productId) })
    },
  }
}
