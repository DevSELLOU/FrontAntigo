'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Product } from '@/interfaces/product.interface'
import { ProductStockDto } from '@/types/dto/product-stock-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function insertProductStockAction(
  companyId: number,
  actionDto: Omit<ProductStockDto, 'quantity'> & {
    quantity: number
  }
): Promise<CommonResponse<Product> | ApiErrorResponse> {
  const response = await handleServerAction<Product>({
    url: `/company/${companyId}/products/stock-movement`,
    method: 'POST',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/products`)

  return response
}
