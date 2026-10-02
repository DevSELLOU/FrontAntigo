'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Customer } from '@/interfaces/customer.interface'
import { handleServerAction } from '@/utils/server-action.util'

export async function fetchCustomerByIdAction(
  customerId: number,
  companyId: number
): Promise<CommonResponse<Customer> | ApiErrorResponse> {
  return handleServerAction<Customer>({
    url: `/company/${companyId}/customer/${customerId}`,
    method: 'GET'
  })
}