'use server'

import { UserStatus } from '@/enums/user-status.enum'
import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { User } from '@/interfaces/user.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updateUserStatusAction(
  userId: number,
  status: UserStatus.Active | UserStatus.Inactive
): Promise<CommonResponse<User> | ApiErrorResponse> {
  const response = await handleServerAction<User>({
    url: `/user/${userId}`,
    method: 'PATCH',
    body: { status }
  })

  revalidateTag('/users')

  return response
}
