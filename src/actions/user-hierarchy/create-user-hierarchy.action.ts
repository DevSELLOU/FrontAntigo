'use server'

import { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { UserHierarchy } from '@/interfaces/user-hierarchy.interface'
import { UserHierarchyDto } from '@/types/dto/user-hierarchy-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function createUserHierarchyAction(
  actionDto: UserHierarchyDto,
): Promise<CommonResponse<UserHierarchy> | ApiErrorResponse> {
  const url = `/user-hierarchy/assign-manager`
  const response = await handleServerAction<UserHierarchy>({
    url: url,
    method: 'POST',
    body: actionDto,
  })

  revalidateTag(url)

  return response
}
