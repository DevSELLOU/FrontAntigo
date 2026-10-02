'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { Company } from '@/interfaces/company.interface'
import { CompanyPreferencesDto } from '@/types/dto/company-preferences-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updateCompanyPreferencesAction(
  companyId: number,
  actionDto: CompanyPreferencesDto
): Promise<CommonResponse<Company> | ApiErrorResponse> {
  const response = await handleServerAction<Company>({
    url: `/company/${companyId}/settings/preferences`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/settings`)

  return response
}
