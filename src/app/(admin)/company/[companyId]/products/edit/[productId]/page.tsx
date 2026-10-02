import { ProductForm } from '@/components/products/common/form/product-form'
import { METADATA_TITLE_PREFIX } from '@/constants'
import type { Category } from '@/interfaces/category.interface'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import type { Product } from '@/interfaces/product.interface'
import { fetchData } from '@/utils/fetch-data'
import { Metadata } from 'next'

interface PageProps {
  params: {
    companyId: number
    productId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Editar Produto'
}

export default async function EditProductPage({ params }: PageProps) {
  const { companyId, productId } = params

  const [productResponse, categoriesResponse] = await Promise.all([
    fetchData<CommonResponse<Product>>(`/company/${companyId}/products/${productId}`, 'Falha ao carregar produto.'),
    fetchData<PaginatedResponse<Category>>(`/company/${companyId}/categories`, 'Falha ao carregar categorias.')
  ])

  const { data: product } = productResponse
  const { data: categories } = categoriesResponse

  if (!productResponse) {
    throw new Error('Produto não encontrado')
  }

  return <ProductForm companyId={companyId} product={product} categories={categories} />
}
