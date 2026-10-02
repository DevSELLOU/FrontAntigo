'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import { Category } from '@/interfaces/category.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { CategoryDto } from '@/types/dto/category-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createCategoryAction(
  companyId: number,
  actionDto: CategoryDto
): Promise<CommonResponse<Category> | ApiErrorResponse> {
  const response = await handleServerAction<Category>({
    url: `/company/${companyId}/categories`,
    method: 'POST',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/categories`)

  return response
}
