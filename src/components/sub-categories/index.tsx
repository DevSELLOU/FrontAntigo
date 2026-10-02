'use client'

import { Pagination } from '@/components/admin/pagination'
import { AdvancedFilterDrawer } from '@/components/shared/advanced-filter-drawer'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { Button } from '@/components/ui/button'
import { useDelayedUrlSearch } from '@/hooks/use-delayed-url-search'
import { Category } from '@/interfaces/category.interface'
import type { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { SubCategory } from '@/interfaces/sub-category-interface'
import { countActiveFilters } from '@/utils/advanced-filter/count-active-filters'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'
import { ArrowLeft, Layers } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { CreateSubCategoryModal } from './create-sub-category-modal'
import { SubCategoryTable } from './sub-category-table'

interface CompanySubCategoriesProps {
  subCategories: SubCategory[]
  category: Category
  metadata: PaginatedResponseMetadata
  filterFields: FilterField[]
  companyId: number
}

export function CompanySubCategories({
  subCategories,
  category,
  metadata,
  filterFields,
  companyId
}: CompanySubCategoriesProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { query, setQuery } = useDelayedUrlSearch()

  const filterCount = useMemo(() => countActiveFilters(searchParams), [searchParams])

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ListingPageHeader
        card
        icon={<Layers className='h-5 w-5' />}
        eyebrow='Gerenciamento'
        title='Subcategorias'
        description={`Detalhe a categoria ${category.name} em subcategorias.`}
        searchValue={query}
        onSearch={setQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={filterCount}
        showViewSelector={false}
        secondaryActions={
          <Button
            variant='secondary'
            className='gap-2'
            onClick={() => router.push(`/company/${companyId}/settings?tab=categorias`)}
          >
            <ArrowLeft className='h-4 w-4' />
            Categorias
          </Button>
        }
        primaryAction={{ label: 'Nova subcategoria', onClick: () => setIsCreateOpen(true) }}
      />

      <AdvancedFilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        fields={filterFields}
        title='Filtrar subcategorias'
        subtitle='Refine por nome.'
      />

      <div className='flex flex-col gap-4 min-w-0'>
        <SubCategoryTable subCategories={subCategories} companyId={companyId} />
        <Pagination metadata={metadata} />
      </div>

      {isCreateOpen && (
        <CreateSubCategoryModal
          open
          onClose={() => setIsCreateOpen(false)}
          companyId={companyId}
          categoryId={category.id}
        />
      )}
    </div>
  )
}
