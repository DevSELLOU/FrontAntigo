import { CompanyProducts } from '@/components/products'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Category } from '@/interfaces/category.interface'
import { DefaultSearchParams } from '@/interfaces/default-search-params.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { Product } from '@/interfaces/product.interface'
import { PriceTable } from '@/interfaces/price-table.interface'
import { fetchData } from '@/utils/fetch-data'
import { getPageParams } from '@/utils/get-page-params.util'
import { Metadata } from 'next'

interface PageProps {
  searchParams: DefaultSearchParams
  params: {
    companyId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Produtos'
}

export default async function ProductsPage({ searchParams, params }: PageProps) {
  const { companyId } = params
  const pageParams = getPageParams({ searchParams, includeDateFilters: false })
  const productsUrl = `/company/${companyId}/products?${pageParams.toString()}`
  const categoriesUrl = `/company/${companyId}/categories`
  const priceTablesUrl = `/company/${companyId}/price-tables?filters=${encodeURIComponent(JSON.stringify({ status: 'ACTIVE' }))}&limit=100`

  const [productsResponse, categoriesResponse, priceTablesResponse] = await Promise.all([
    fetchData<PaginatedResponse<Product>>(productsUrl, 'Falha ao buscar produtos.'),
    fetchData<PaginatedResponse<Category>>(categoriesUrl, 'Falha ao buscar categorias.'),
    fetchData<PaginatedResponse<PriceTable>>(priceTablesUrl, 'Falha ao buscar tabelas de preço.').catch(() => ({ data: [], metadata: { page: 1, limit: 100, total: 0 } }))
  ])

  const { data: products, metadata } = productsResponse
  const { data: categories } = categoriesResponse
  const { data: activePriceTables } = priceTablesResponse

  return <CompanyProducts products={products} categories={categories} metadata={metadata} priceTables={activePriceTables} />
}
