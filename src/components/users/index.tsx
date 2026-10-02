'use client'

import { Users as UsersIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Pagination } from '../admin/pagination'
import { AdvancedFilterDrawer } from '../shared/advanced-filter-drawer'
import { ListingPageHeader } from '../shared/listing-page-header'
import { CreateUserModal } from './create-user-modal'
import { UsersTable } from './users-table'
import { useDelayedUrlSearch } from '@/hooks/use-delayed-url-search'
import { countActiveFilters } from '@/utils/advanced-filter/count-active-filters'
import { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { User } from '@/interfaces/user.interface'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'

export interface AdminUsersProps {
  users: User[]
  metadata: PaginatedResponseMetadata
  filterFields: FilterField[]
}

export function AdminUsers({ users, metadata, filterFields }: AdminUsersProps) {
  const searchParams = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { query, setQuery } = useDelayedUrlSearch()

  const filterCount = useMemo(() => countActiveFilters(searchParams), [searchParams])

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ListingPageHeader
        card
        icon={<UsersIcon className='h-5 w-5' />}
        eyebrow='Acessos e permissões'
        title='Usuários'
        description='Gerencie os administradores com acesso ao painel Sellou.'
        searchValue={query}
        onSearch={setQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={filterCount}
        showViewSelector={false}
        primaryAction={{ label: 'Novo usuário', onClick: () => setIsCreateOpen(true) }}
      />

      <AdvancedFilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        fields={filterFields}
        title='Filtrar usuários'
        subtitle='Refine por nome, e-mail, cargo e status.'
      />

      <div className='flex flex-col gap-4 min-w-0'>
        <UsersTable users={users} />
        <Pagination metadata={metadata} />
      </div>

      {isCreateOpen && <CreateUserModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />}
    </div>
  )
}
