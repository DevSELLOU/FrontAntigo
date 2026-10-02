'use server'

import type { UserRole } from '@/enums/user-role.enum'
import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import type { User } from '@/interfaces/user.interface'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

interface CreateUserActionDto {
  name: string
  email: string
  role: UserRole
}

export async function createUserAction(
  createUserActionDto: CreateUserActionDto
): Promise<CommonResponse<User> | ApiErrorResponse> {
  const response = await handleServerAction<User>({
    url: '/user',
    method: 'POST',
    body: createUserActionDto
  })

  revalidateTag('/users')

  return response
}
