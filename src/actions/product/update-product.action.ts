'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Product } from '@/interfaces/product.interface'
import { ProductDto } from '@/types/dto/product-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updateProductAction(
  companyId: number,
  productId: number,
  actionDto: ProductDto
): Promise<CommonResponse<Product> | ApiErrorResponse> {
  const response = await handleServerAction<Product>({
    url: `/company/${companyId}/products/${productId}`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/products`)

  return response
}
