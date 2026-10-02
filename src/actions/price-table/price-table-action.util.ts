'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { PriceTable } from '@/interfaces/price-table.interface'
import { PriceTableDto } from '@/types/dto/price-table-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function executePriceTableAction(
  companyId: number,
  priceTableId: number | null,
  actionDto: PriceTableDto,
  method: 'POST' | 'PATCH'
): Promise<CommonResponse<PriceTable> | ApiErrorResponse> {
  const url = priceTableId
    ? `/company/${companyId}/price-tables/${priceTableId}`
    : `/company/${companyId}/price-tables`

  const response = await handleServerAction<PriceTable>({
    url,
    method,
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/price-tables`)

  return response
}