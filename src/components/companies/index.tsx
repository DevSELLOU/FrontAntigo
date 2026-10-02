'use client'

import { Building } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Pagination } from '../admin/pagination'
import { AdvancedFilterDrawer } from '../shared/advanced-filter-drawer'
import { ListingPageHeader } from '../shared/listing-page-header'
import { CompanyTable } from './company-table'
import { CreateCompanyModal } from './create-company-modal'
import { useDelayedUrlSearch } from '@/hooks/use-delayed-url-search'
import { countActiveFilters } from '@/utils/advanced-filter/count-active-filters'
import { Company } from '@/interfaces/company.interface'
import { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'

export interface AdminCompaniesProps {
  companies: Company[]
  metadata: PaginatedResponseMetadata
  filterFields: FilterField[]
}

export function AdminCompanies({ companies, metadata, filterFields }: AdminCompaniesProps) {
  const searchParams = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { query, setQuery } = useDelayedUrlSearch()

  const filterCount = useMemo(() => countActiveFilters(searchParams), [searchParams])

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ListingPageHeader
        card
        icon={<Building className='h-5 w-5' />}
        eyebrow='Contas da plataforma'
        title='Empresas'
        description='Gerencie as empresas atendidas pela Sellou, seus dados cadastrais e o acesso ao painel.'
        searchValue={query}
        onSearch={setQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={filterCount}
        showViewSelector={false}
        primaryAction={{ label: 'Nova empresa', onClick: () => setIsCreateOpen(true) }}
      />

      <AdvancedFilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        fields={filterFields}
        title='Filtrar empresas'
        subtitle='Refine por razão social, CNPJ, status e outras condições.'
      />

      <div className='flex flex-col gap-4 min-w-0'>
        <CompanyTable companies={companies} />
        <Pagination metadata={metadata} />
      </div>

      {isCreateOpen && <CreateCompanyModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />}
    </div>
  )
}
