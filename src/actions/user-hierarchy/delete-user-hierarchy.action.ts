
'use server'

import { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function deleteUserHierarchyAction(
  companyId: number,
  subordinateId: number,
): Promise<CommonResponse<void> | ApiErrorResponse> {
  const response = await handleServerAction<void>({
    url: `/user-hierarchy/${companyId}/${subordinateId}/manager`,
    method: 'DELETE',
  })

  revalidateTag(`/user-hierarchy`)

  return response
}
