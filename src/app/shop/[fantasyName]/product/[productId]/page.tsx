import { ProductDetails } from '@/components/shop/product-details'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { Company } from '@/interfaces/company.interface'
import { Product } from '@/interfaces/product.interface'
import { fetchData } from '@/utils/fetch-data'
import { ChevronLeft } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Detalhes do Produto'
}

export default async function ProductPage({ params }: { params: { fantasyName: string; productId: number } }) {
  const { fantasyName, productId } = params

  // `params` hands back the RAW path segment, already percent-encoded — encoding it again produced
  // `Alfa%2520Solu%25C3%25A7...`. The API survived that only because Nest decodes the param and the
  // controller decodes a second time, but the `<Link>` below had nobody to undo it, so "Voltar para
  // os produtos" landed on a 404 for any shop whose name has a space or an accent.
  const companyUrl = `/company/by-fantasy-name/${fantasyName}/public`
  const companyResponse = await fetchData<CommonResponse<Company>>(companyUrl, 'Falha ao buscar empresa.')

  if (!companyResponse?.data?.id) {
    notFound()
  }

  const companyId = companyResponse.data.id

  const productsUrl = `/company/${companyId}/products/${productId}`

  const productsResponse = await fetchData<CommonResponse<Product>>(productsUrl, 'Falha ao buscar produtos.')

  const product = productsResponse?.data

  // Without this the missing product reached `ProductDetails`, which reads `product.photos.length`
  // straight away — so a stale or mistyped link crashed the page instead of showing the 404.
  if (!product?.id) {
    notFound()
  }

  return (
    <div className='flex flex-col px-4 py-5 sm:px-6 md:px-10'>
      <Link
        href={`/shop/${fantasyName}`}
        className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6'
      >
        <ChevronLeft className='mr-1 h-4 w-4' />
        Voltar para os produtos
      </Link>

      <ProductDetails product={product} />
    </div>
  )
}
