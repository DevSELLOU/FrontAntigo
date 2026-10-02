'use server'

import { GenericStatus } from '@/enums/generic-status.enum'
import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { PriceTable } from '@/interfaces/price-table.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updatePriceTableStatusAction(
  companyId: number,
  priceTableId: number,
  status: GenericStatus
): Promise<CommonResponse<PriceTable> | ApiErrorResponse> {
  const response = await handleServerAction<PriceTable>({
    url: `/company/${companyId}/price-tables/${priceTableId}/status`,
    method: 'POST',
    body: { status }
  })

  revalidateTag(`/company/${companyId}/price-tables`)

  return response
}
