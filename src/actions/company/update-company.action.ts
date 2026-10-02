'use server'

import { GenericStatus } from '@/enums/generic-status.enum'
import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Company } from '@/interfaces/company.interface'
import { CompanyDto } from '@/types/dto/company-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updateCompanyAction(
  companyId: number,
  actionDto: CompanyDto & { status: GenericStatus }
): Promise<CommonResponse<Company> | ApiErrorResponse> {
  const response = await handleServerAction<Company>({
    url: `/company/${companyId}`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag('/companies')

  return response
}
