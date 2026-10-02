'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { PriceTable } from '@/interfaces/price-table.interface'
import { PriceTableDto } from '@/types/dto/price-table-dto'
import { executePriceTableAction } from './price-table-action.util'

export async function updatePriceTableAction(
  companyId: number,
  priceTableId: number,
  actionDto: PriceTableDto
): Promise<CommonResponse<PriceTable> | ApiErrorResponse> {
  return executePriceTableAction(companyId, priceTableId, actionDto, 'PATCH')
}
