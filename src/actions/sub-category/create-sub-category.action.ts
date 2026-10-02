'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { SubCategory } from '@/interfaces/sub-category-interface'
import { SubCategoryDto } from '@/types/dto/sub-category-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createSubCategoryAction(
  companyId: number,
  categoryId: number,
  actionDto: SubCategoryDto
): Promise<CommonResponse<SubCategory> | ApiErrorResponse> {
  const response = await handleServerAction<SubCategory>({
    url: `/company/${companyId}/categories/${categoryId}/sub-categories`,
    method: 'POST',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/sub-categories/${categoryId}`)

  return response
}
