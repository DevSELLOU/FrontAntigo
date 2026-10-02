'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Company } from '@/interfaces/company.interface'
import { CompanyDto } from '@/types/dto/company-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createCompanyAction(actionDto: CompanyDto): Promise<CommonResponse<Company> | ApiErrorResponse> {
  const response = await handleServerAction<Company>({
    url: '/company',
    method: 'POST',
    body: actionDto
  })

  revalidateTag('/companies')

  return response
}
