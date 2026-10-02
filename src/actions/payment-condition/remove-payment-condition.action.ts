'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function removePaymentConditionAction(
  companyId: number,
  conditionId: number
): Promise<CommonResponse<void> | ApiErrorResponse> {
  const response = await handleServerAction<void>({
    url: `/company/${companyId}/payment-condition/${conditionId}`,
    method: 'DELETE'
  })

  revalidateTag(`/company/${companyId}/payment-conditions`)

  return response
}
