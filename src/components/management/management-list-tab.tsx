'use client'

import { Pagination } from '@/components/admin/pagination'
import { ManagementShell } from '@/components/management/management-shell'
import { AdvancedFilterDrawer } from '@/components/shared/advanced-filter-drawer'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import type { ManagementTabId } from '@/constants/management-tabs'
import { useDelayedUrlSearch } from '@/hooks/use-delayed-url-search'
import type { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { countActiveFilters } from '@/utils/advanced-filter/count-active-filters'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'
import { useSearchParams } from 'next/navigation'
import { ReactNode, useMemo, useState } from 'react'

interface ManagementListTabProps {
  tab: ManagementTabId
  isAdministrator: boolean
  companyId: number
  icon: ReactNode
  title: string
  description: string
  filterFields: FilterField[]
  filterTitle: string
  filterSubtitle: string
  createLabel: string
  /**
   * Rendered only while open. A render function (instead of a ready-made node) is what lets each
   * tab wire its own create modal — functions don't cross the server/client boundary, so this is
   * why every tab has a thin client wrapper of its own.
   */
  renderCreateModal: (close: () => void) => ReactNode
  secondaryActions?: ReactNode
  metadata?: PaginatedResponseMetadata
  children: ReactNode
}

/**
 * Skeleton shared by every listing tab of the management hub (categories, segments, payment
 * conditions, payment methods, company users). All five were the same 66-line page —
 * header + advanced filter + table + pagination — so they are one implementation here, configured
 * per tab, rather than five copies drifting apart.
 */
export function ManagementListTab({
  tab,
  isAdministrator,
  companyId,
  icon,
  title,
  description,
  filterFields,
  filterTitle,
  filterSubtitle,
  createLabel,
  renderCreateModal,
  secondaryActions,
  metadata,
  children
}: ManagementListTabProps) {
  const searchParams = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { query, setQuery } = useDelayedUrlSearch()

  const filterCount = useMemo(() => countActiveFilters(searchParams), [searchParams])

  return (
    <ManagementShell
      tab={tab}
      isAdministrator={isAdministrator}
      companyId={companyId}
      header={
        <ListingPageHeader
          card
          icon={icon}
          eyebrow='Gerenciamento'
          title={title}
          description={description}
          searchValue={query}
          onSearch={setQuery}
          onFilterClick={() => setIsFilterOpen(true)}
          filterCount={filterCount}
          showViewSelector={false}
          secondaryActions={secondaryActions}
          primaryAction={{ label: createLabel, onClick: () => setIsCreateOpen(true) }}
        />
      }
    >
      <AdvancedFilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        fields={filterFields}
        title={filterTitle}
        subtitle={filterSubtitle}
      />

      {children}

      <Pagination metadata={metadata} />

      {isCreateOpen && renderCreateModal(() => setIsCreateOpen(false))}
    </ManagementShell>
  )
}
