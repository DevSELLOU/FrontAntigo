'use client'

import { ordersExcludeFields, ordersFieldMapping } from '@/helpers/orders-field-mapping'
import { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { cn } from '@/lib/utils'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { apiToFilterFields } from '@/utils/advanced-filter/filter-fields'
import { useDelayedUrlSearch } from '@/hooks/use-delayed-url-search'
import { usePersistedViewMode } from '@/hooks/use-persisted-view-mode'
import { Clipboard } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Pagination } from '../admin/pagination'
import { ListingPageHeader } from '../shared/listing-page-header'
import { OrdersFilterDrawer } from './common/orders-filter-drawer'
import { KanbanBoard } from './kanban'
import { OrderCard } from './mobile/order-card'
import { OrdersTable } from './desktop/orders-table'

export function CompanyOrders({
  orderWrapper,
  metadata
}: {
  orderWrapper: OrderWrapper
  metadata: PaginatedResponseMetadata
}) {
  const [layoutMode, setLayoutMode] = usePersistedViewMode('orders-view-mode', 'list')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const { query, setQuery } = useDelayedUrlSearch()

  const filterCount = useMemo(() => {
    let count = 0
    const filtersParam = searchParams.get('filters')
    if (filtersParam) {
      try {
        const parsed = JSON.parse(filtersParam)
        count += Object.entries(parsed).filter(([key, value]) => {
          if (key === 'year' || key === 'month') return false
          return value !== undefined && value !== null
        }).length
        if (parsed.year || (parsed.month && parsed.month !== 0)) count += 1
      } catch {
        // ignore malformed filters param
      }
    }
    return count
  }, [searchParams])

  const filterFields = apiToFilterFields({
    enumReference: 'orders',
    data: orderWrapper?.orders?.[0],
    fieldMappings: ordersFieldMapping,
    excludeFields: ordersExcludeFields
  })

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ListingPageHeader
        card
        icon={<Clipboard className='h-5 w-5' />}
        eyebrow='Gestão de pedidos'
        title='Pedidos'
        description='Acompanhe, aprove e fature seus pedidos.'
        searchValue={query}
        onSearch={setQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={filterCount}
        currentView={layoutMode}
        onViewChange={setLayoutMode}
        enableKanban
        primaryAction={{
          label: 'Novo pedido',
          onClick: () => router.push(`/company/${orderWrapper.companyId}/orders/create`)
        }}
      />

      <OrdersFilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        orderWrapper={orderWrapper}
        fields={filterFields}
      />

      {layoutMode === 'kanban' ? (
        orderWrapper?.orders?.length > 0 ? (
          <KanbanBoard orderWrapper={orderWrapper} />
        ) : (
          <div className='flex items-center p-10 min-h-60 justify-center text-text-muted text-center text-body'>
            Nenhum pedido encontrado.
          </div>
        )
      ) : (
        <div className='flex flex-col gap-4 min-w-0'>
          {layoutMode === 'list' ? (
            orderWrapper?.orders?.length ? (
              <OrdersTable orderWrapper={orderWrapper} />
            ) : null
          ) : (
            <div
              className={cn('gap-4', {
                'grid xs:grid-cols-1 sm:grid-cols-2 xl:grid-cols-3': layoutMode === 'grid'
              })}
            >
              {orderWrapper?.orders?.length
                ? orderWrapper?.orders?.map((product, index) => (
                    <OrderCard key={index} order={product} orderWrapper={orderWrapper} />
                  ))
                : null}
            </div>
          )}

          {orderWrapper?.orders?.length === 0 && (
            <div className='flex items-center p-10 min-h-60 justify-center text-text-muted text-center text-body'>
              Nenhum pedido encontrado.
            </div>
          )}

          <Pagination metadata={metadata} />
        </div>
      )}
    </div>
  )
}
