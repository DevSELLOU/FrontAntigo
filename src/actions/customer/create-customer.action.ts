'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Customer } from '@/interfaces/customer.interface'
import { CustomerDto } from '@/types/dto/customer-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createCustomerAction(
  companyId: number,
  actionDto: Omit<CustomerDto, 'subSegmentId'> & { subSegmentId: number }
): Promise<CommonResponse<Customer> | ApiErrorResponse> {
  const response = await handleServerAction<Customer>({
    url: `/company/${companyId}/customer`,
    method: 'POST',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/customers`)

  return response
}
