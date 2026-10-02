'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { PaymentMethodDto } from '@/types/dto/payment-method-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createPaymentMethodAction(
  companyId: number,
  actionDto: PaymentMethodDto
): Promise<CommonResponse<PaymentMethod> | ApiErrorResponse> {
  const response = await handleServerAction<PaymentMethod>({
    url: `/company/${companyId}/payment-method`,
    method: 'POST',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/payment-methods`)

  return response
}
