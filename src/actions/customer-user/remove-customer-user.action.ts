'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function removeCustomerUserAction(
  companyId: number,
  customerId: number,
  customerUserId: number
): Promise<CommonResponse<void> | ApiErrorResponse> {
  const response = await handleServerAction<void>({
    url: `/company/${companyId}/customers/${customerId}/customers-clients/${customerUserId}`,
    method: 'DELETE'
  })

  revalidateTag(`/company/${companyId}/customers/${customerId}`)

  return response
}
