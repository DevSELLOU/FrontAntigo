'use client'

import { CategoryTable } from '@/components/categories/category-table'
import { CreateCategoryModal } from '@/components/categories/create-category-modal'
import { ManagementListTab } from '@/components/management/management-list-tab'
import { Category } from '@/interfaces/category.interface'
import type { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'
import { Tags } from 'lucide-react'

interface CategoriesTabProps {
  categories: Category[]
  metadata: PaginatedResponseMetadata
  filterFields: FilterField[]
  companyId: number
  isAdministrator: boolean
}

export function CategoriesTab({ categories, metadata, filterFields, companyId, isAdministrator }: CategoriesTabProps) {
  return (
    <ManagementListTab
      tab='categorias'
      isAdministrator={isAdministrator}
      companyId={companyId}
      icon={<Tags className='h-5 w-5' />}
      title='Categorias'
      description='Organize o catálogo em categorias e subcategorias usadas em produtos e na loja.'
      filterFields={filterFields}
      filterTitle='Filtrar categorias'
      filterSubtitle='Refine por nome e descrição.'
      createLabel='Nova categoria'
      renderCreateModal={close => <CreateCategoryModal open onClose={close} companyId={companyId} />}
      metadata={metadata}
    >
      <CategoryTable categories={categories} companyId={companyId} />
    </ManagementListTab>
  )
}
