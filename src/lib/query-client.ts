import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 60 * 1000, // 1 hour - data is fresh for 1 hour
      gcTime: 2 * 60 * 60 * 1000, // 2 hours - keep data in cache for 2 hours after last use
      retry: 2, // Retry failed requests 2 times
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when reconnecting
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
})

// Query keys for better cache management
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: (companyId: number) => ['products', 'list', companyId] as const,
    detail: (companyId: number, productId: number) => ['products', 'detail', companyId, productId] as const,
    search: (companyId: number, query: string) => ['products', 'search', companyId, query] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: (companyId: number) => ['orders', 'list', companyId] as const,
    detail: (companyId: number, orderId: number) => ['orders', 'detail', companyId, orderId] as const,
    recent: (companyId: number) => ['orders', 'recent', companyId] as const,
  },
  customers: {
    all: ['customers'] as const,
    lists: (companyId: number) => ['customers', 'list', companyId] as const,
    detail: (companyId: number, customerId: number) => ['customers', 'detail', companyId, customerId] as const,
    search: (companyId: number, query: string) => ['customers', 'search', companyId, query] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: (companyId: number) => ['categories', 'list', companyId] as const,
  },
}
