'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function removeCategoryAction(
  companyId: number,
  categoryId: number
): Promise<CommonResponse<void> | ApiErrorResponse> {
  const response = await handleServerAction<void>({
    url: `/company/${companyId}/categories/${categoryId}`,
    method: 'DELETE'
  })

  revalidateTag(`/company/${companyId}/categories`)

  return response
}
