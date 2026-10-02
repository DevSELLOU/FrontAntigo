'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { ChangePasswordDto } from '@/types/dto/change-password-dto'
import { handleServerAction } from '@/utils/server-action.util'

export async function changePasswordAction(
  actionDto: Pick<ChangePasswordDto, 'currentPassword' | 'newPassword'>,
  shopAccessToken?: string
): Promise<CommonResponse<void> | ApiErrorResponse> {
  return handleServerAction({
    url: '/auth/password',
    method: 'PATCH',
    body: actionDto,
    shopAccessToken
  })
}
