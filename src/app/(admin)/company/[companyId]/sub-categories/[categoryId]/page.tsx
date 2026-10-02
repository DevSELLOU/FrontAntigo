import { CompanySubCategories } from '@/components/sub-categories'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { defaultExcludeFields } from '@/constants/advanced-filter'
import { Category } from '@/interfaces/category.interface'
import { DefaultSearchParams } from '@/interfaces/default-search-params.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { SubCategory } from '@/interfaces/sub-category-interface'
import { apiToFilterFields } from '@/utils/advanced-filter/filter-fields'
import { fetchData } from '@/utils/fetch-data'
import { getPageParams } from '@/utils/get-page-params.util'
import { Metadata } from 'next'

interface PageProps {
  searchParams: DefaultSearchParams
  params: {
    companyId: number
    categoryId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Subcategorias'
}

export default async function SubCategoriesPage({ searchParams, params }: PageProps) {
  const { companyId, categoryId } = params
  const pageParams = getPageParams({ searchParams, includeDateFilters: false })

  const subCategoriesUrl = `/company/${companyId}/categories/${categoryId}/sub-categories?${pageParams}`
  const categoriesUrl = `/company/${companyId}/categories?${pageParams}`

  const [subCategoryResponse, categoryResponse] = await Promise.all([
    fetchData<PaginatedResponse<SubCategory>>(subCategoriesUrl, 'Falha ao buscar subcategorias.'),
    fetchData<PaginatedResponse<Category>>(categoriesUrl, 'Falha ao buscar categorias.')
  ])

  const { data: subCategories, metadata } = subCategoryResponse
  const { data: categories } = categoryResponse

  const category = categories.find(cat => cat.id === Number(categoryId))
  if (!category) {
    throw new Error('Nenhuma categoria encontrada para o ID informado.')
  }

  const filterFields = apiToFilterFields({
    data: subCategories?.[0],
    excludeFields: [...defaultExcludeFields, 'categoryId'],
    fieldMappings: {
      name: {
        type: 'text',
        label: 'Nome'
      }
    }
  })

  return (
    <CompanySubCategories
      subCategories={subCategories}
      category={category}
      metadata={metadata}
      filterFields={filterFields}
      companyId={companyId}
    />
  )
}
