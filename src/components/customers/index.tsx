'use client'

import { StatusCounts } from '@/app/(admin)/company/[companyId]/customers/page'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { customersExcludeFields, customersFieldMapping } from '@/helpers/customers-field-mapping'
import { useDelayedUrlSearch } from '@/hooks/use-delayed-url-search'
import { usePersistedViewMode } from '@/hooks/use-persisted-view-mode'
import { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { CustomerWrapper } from '@/types/customer-wrapper.type'
import { countActiveFilters } from '@/utils/advanced-filter/count-active-filters'
import { apiToFilterFields } from '@/utils/advanced-filter/filter-fields'
import {
  buildCustomerStatusSearch,
  readCustomerStatusFilter,
  type CustomerStatusFilter
} from '@/utils/customers/status-filter.util'
import { Contact } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Pagination } from '../admin/pagination'
import { AdvancedFilterDrawer } from '../shared/advanced-filter-drawer'
import { ListingPageHeader } from '../shared/listing-page-header'
import { CreateCustomerModalLoader } from './common/create-customer-modal-loader'
import { CustomerSegmentedTabs, type SegmentedTabItem } from './common/customer-segmented-tabs'
import { ImportCustomersButton } from './common/import-customers-button'
import { CustomersTable } from './desktop/customers-table'
import CustomerCard from './mobile/customer-card'

export interface CompanyCustomersProps {
  customerWrapper: CustomerWrapper
  metadata: PaginatedResponseMetadata
  statusCounts: StatusCounts
}

const STATUS_TABS: { value: CustomerStatusFilter; label: string; countKey: keyof StatusCounts }[] = [
  { value: 'ALL', label: 'Todos', countKey: 'all' },
  { value: CustomerStatus.Active, label: 'Ativos', countKey: 'active' },
  { value: CustomerStatus.Inactive, label: 'Inativos', countKey: 'inactive' },
  { value: CustomerStatus.Defaulting, label: 'Inadimplentes', countKey: 'defaulting' }
]

export const CompanyCustomers = ({ customerWrapper, metadata, statusCounts }: CompanyCustomersProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [layoutMode, setLayoutMode] = usePersistedViewMode('customers-view-mode', 'grid')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { query, setQuery } = useDelayedUrlSearch()

  const activeStatus = readCustomerStatusFilter(searchParams.get('filters'))

  // `status` lives inside the same `filters` param the advanced filter writes to, but it has its
  // own control right below the header — counting it here would light the filter badge just from
  // switching status tabs.
  const filterCount = useMemo(() => countActiveFilters(searchParams, { exclude: ['status'] }), [searchParams])

  const filterFields = apiToFilterFields({
    data: customerWrapper?.customers?.[0],
    fieldMappings: customersFieldMapping,
    enumReference: 'customers',
    excludeFields: customersExcludeFields
  })

  const statusTabs: SegmentedTabItem<CustomerStatusFilter>[] = STATUS_TABS.map(({ value, label, countKey }) => ({
    value,
    label,
    count: statusCounts[countKey]
  }))

  const handleStatusChange = (status: CustomerStatusFilter) => {
    router.push(`${pathname}?${buildCustomerStatusSearch(new URLSearchParams(searchParams), status)}`)
  }

  const customers = customerWrapper.customers

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ListingPageHeader
        card
        icon={<Contact className='h-5 w-5' />}
        eyebrow='Carteira de clientes'
        title='Clientes'
        description='Gerencie a carteira, o crédito e os contatos dos seus clientes.'
        searchValue={query}
        onSearch={setQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={filterCount}
        currentView={layoutMode}
        onViewChange={setLayoutMode}
        secondaryActions={<ImportCustomersButton companyId={customerWrapper.companyId} />}
        primaryAction={{ label: 'Novo cliente', onClick: () => setIsCreateOpen(true) }}
      />

      <AdvancedFilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        fields={filterFields}
        title='Filtrar clientes'
        subtitle='Refine por razão social, documento, cidade, crédito e mais.'
      />

      <CustomerSegmentedTabs
        items={statusTabs}
        value={activeStatus}
        onChange={handleStatusChange}
        ariaLabel='Filtrar clientes por situação'
      />

      <div className='flex flex-col gap-4 min-w-0'>
        {layoutMode === 'list' ? (
          <CustomersTable customers={customers ?? []} segments={customerWrapper.segments ?? []} />
        ) : customers?.length ? (
          <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'>
            {customers.map(customer => (
              <CustomerCard key={customer.id} customer={customer} customerWrapper={customerWrapper} />
            ))}
          </div>
        ) : (
          <div className='flex items-center p-10 min-h-60 justify-center text-text-muted text-center text-body'>
            Nenhum cliente encontrado para o filtro selecionado.
          </div>
        )}

        <Pagination metadata={metadata} />
      </div>

      <CreateCustomerModalLoader
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        companyId={customerWrapper.companyId}
        segments={customerWrapper.segments ?? []}
      />
    </div>
  )
}
