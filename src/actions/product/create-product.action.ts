'use server'

import { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Product, ProductPhoto } from '@/interfaces/product.interface'
import { ProductDto } from '@/types/dto/product-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createProductAction(
  companyId: number,
  actionDto: ProductDto & {
    photos: Partial<ProductPhoto>[]
  }
): Promise<CommonResponse<Product> | ApiErrorResponse> {
  const response = await handleServerAction<Product>({
    url: `/company/${companyId}/products`,
    method: 'POST',
    body: actionDto
  })

  // Revalidate server cache
  revalidateTag(`/company/${companyId}/products`)

  return response
}
