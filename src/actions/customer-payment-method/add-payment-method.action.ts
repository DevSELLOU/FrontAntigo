'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function addCustomerPaymentMethod(
  companyId: number,
  customerId: number,
  paymentMethodId: number
): Promise<CommonResponse<{ message?: string }> | ApiErrorResponse> {
  const response = await handleServerAction<{ message?: string }>({
    url: `/company/${companyId}/customer/${customerId}/payment-method/${paymentMethodId}`,
    method: 'POST'
  })

  revalidateTag(`/company/${companyId}/customers`)

  return response
}
