'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Company } from '@/interfaces/company.interface'
import { UserCompanyDto } from '@/types/dto/user-company-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updateCustomerUserAction(
  companyId: number,
  customerId: number,
  customerUserId: number,
  actionDto: Omit<UserCompanyDto, 'email'>
): Promise<CommonResponse<Company> | ApiErrorResponse> {
  const response = await handleServerAction<Company>({
    url: `/company/${companyId}/customers/${customerId}/customers-clients/${customerUserId}`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/customers/${customerId}`)

  return response
}
