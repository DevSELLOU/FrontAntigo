'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { PaymentConditionDto } from '@/types/dto/payment-condition-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updatePaymentConditionAction(
  companyId: number,
  conditionId: number,
  actionDto: PaymentConditionDto
): Promise<CommonResponse<PaymentCondition> | ApiErrorResponse> {
  const response = await handleServerAction<PaymentCondition>({
    url: `/company/${companyId}/payment-condition/${conditionId}`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/payment-conditions`)

  return response
}
