'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Customer } from '@/interfaces/customer.interface'
import { handleServerAction } from '@/utils/server-action.util'

export async function fetchCustomersByIdsAction(
  companyId: number,
  ids: number[]
): Promise<CommonResponse<Customer[]> | ApiErrorResponse> {
  const idsParam = ids.join(',')
  return await handleServerAction<Customer[]>({
    url: `/company/${companyId}/customer/batch?ids=${idsParam}`,
    method: 'GET'
  })
}
