'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { SubCategory } from '@/interfaces/sub-category-interface'
import { CategoryDto } from '@/types/dto/category-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updateSubCategoryAction(
  companyId: number,
  categoryId: number,
  subCategoryId: number,
  actionDto: CategoryDto
): Promise<CommonResponse<SubCategory> | ApiErrorResponse> {
  const response = await handleServerAction<SubCategory>({
    url: `/company/${companyId}/categories/${categoryId}/sub-categories/${subCategoryId}`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/sub-categories/${categoryId}`)

  return response
}
