'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Customer } from '@/interfaces/customer.interface'
import { handleServerAction } from '@/utils/server-action.util'

export async function searchCustomersAction(
  companyId: number,
  search: string
): Promise<CommonResponse<Customer[]> | ApiErrorResponse> {
    return await handleServerAction<Customer[]>({
    url: `/company/${companyId}/customer?limit=50&query=${search}`,
    method: 'GET'
  })
}