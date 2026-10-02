import { ProductForm } from '@/components/products/common/form/product-form'
import { METADATA_TITLE_PREFIX } from '@/constants'
import type { Category } from '@/interfaces/category.interface'
import { fetchData } from '@/utils/fetch-data'
import { Metadata } from 'next'

interface PageProps {
  params: {
    companyId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Novo Produto'
}

export default async function CreateProductPage({ params }: PageProps) {
  const { companyId } = params

  const categoriesResponse = await fetchData<{ data: Category[] }>(
    `/company/${companyId}/categories`,
    'Falha ao carregar categorias.'
  )

  const { data: categories } = categoriesResponse

  return <ProductForm companyId={companyId} categories={categories} />
}
