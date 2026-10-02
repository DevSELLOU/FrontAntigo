'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function removeCustomerAction(
  companyId: number,
  customerId: number
): Promise<CommonResponse<void> | ApiErrorResponse> {
  const response = await handleServerAction<void>({
    url: `/company/${companyId}/customer/${customerId}`,
    method: 'DELETE'
  })

  revalidateTag(`/company/${companyId}/customers`)

  return response
}
