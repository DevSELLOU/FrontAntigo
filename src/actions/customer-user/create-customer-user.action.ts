'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Company } from '@/interfaces/company.interface'
import { UserCompanyDto } from '@/types/dto/user-company-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createCustomerUserAction(
  companyId: number,
  customerId: number,
  actionDto: UserCompanyDto
): Promise<CommonResponse<Company> | ApiErrorResponse> {
  const response = await handleServerAction<Company>({
    url: `/company/${companyId}/customers/${customerId}/customers-clients`,
    method: 'POST',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/customers/${customerId}`)

  return response
}
