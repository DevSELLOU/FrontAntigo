'use client'

import { productsExcludeFields, productsFieldMapping } from '@/helpers/products-field-mapping'
import { useDelayedUrlSearch } from '@/hooks/use-delayed-url-search'
import { usePersistedViewMode } from '@/hooks/use-persisted-view-mode'
import { Category } from '@/interfaces/category.interface'
import { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { PriceTable } from '@/interfaces/price-table.interface'
import { Product } from '@/interfaces/product.interface'
import { cn } from '@/lib/utils'
import { apiToFilterFields } from '@/utils/advanced-filter/filter-fields'
import { Boxes } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Pagination } from '../admin/pagination'
import { ListingPageHeader } from '../shared/listing-page-header'
import { ProductsFilterDrawer } from './common/products-filter-drawer'
import { ProductImportButton } from './product-import-button'
import { ProductsTable } from './desktop/products-table'
import ProductCard from './mobile/products-card'

export interface CompanyProductsProps {
  products: Product[]
  categories: Category[]
  metadata: PaginatedResponseMetadata
  priceTables?: PriceTable[]
}

export const CompanyProducts = ({ products, categories, metadata, priceTables = [] }: CompanyProductsProps) => {
  const [layoutMode, setLayoutMode] = usePersistedViewMode('products-view-mode', 'grid')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { companyId } = useParams<{ companyId: string }>()

  const { query, setQuery } = useDelayedUrlSearch()

  const filterCount = useMemo(() => {
    let count = 0
    const filtersParam = searchParams.get('filters')
    if (filtersParam) {
      try {
        const parsed = JSON.parse(filtersParam)
        count += Object.keys(parsed).length
      } catch {
        // ignore malformed filters param
      }
    }
    return count
  }, [searchParams])

  // Sort products: active first, inactive last — only when no explicit column sort is applied,
  // otherwise this would override the server-side order requested via the table header.
  const sortedProducts = searchParams.get('sort')
    ? products
    : [...products].sort((a, b) => {
        const aActive = a.active !== false
        const bActive = b.active !== false
        if (aActive === bActive) return 0
        return aActive ? -1 : 1
      })

  const filterFields = apiToFilterFields({
    data: products?.[0],
    fieldMappings: productsFieldMapping,
    excludeFields: productsExcludeFields
  })

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ListingPageHeader
        card
        icon={<Boxes className='h-5 w-5' />}
        eyebrow='Catálogo e estoque'
        title='Produtos'
        description='Gerencie o catálogo, preços, categorias e estoque da empresa.'
        searchValue={query}
        onSearch={setQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={filterCount}
        currentView={layoutMode}
        onViewChange={setLayoutMode}
        secondaryActions={<ProductImportButton />}
        primaryAction={{
          label: 'Novo',
          onClick: () => router.push(`/company/${companyId}/products/create`)
        }}
      />

      <ProductsFilterDrawer open={isFilterOpen} onOpenChange={setIsFilterOpen} fields={filterFields} />

      <div className='flex flex-col gap-4 min-w-0'>
        {layoutMode === 'list' ? (
          sortedProducts?.length ? (
            <ProductsTable products={sortedProducts} categories={categories} priceTables={priceTables} />
          ) : null
        ) : (
          <div
            className={cn('gap-4', {
              'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5': layoutMode === 'grid'
            })}
          >
            {sortedProducts?.length
              ? sortedProducts?.map(product => <ProductCard key={product.id} product={product} categories={categories} />)
              : null}
          </div>
        )}

        {sortedProducts?.length === 0 && (
          <div className='flex items-center p-10 min-h-60 justify-center text-text-muted tex-center text-body'>
            Nenhum produto encontrado.
          </div>
        )}

        <Pagination metadata={metadata} />
      </div>
    </div>
  )
}
