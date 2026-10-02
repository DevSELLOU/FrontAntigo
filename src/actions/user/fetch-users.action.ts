'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { handleServerAction } from '@/utils/server-action.util'

interface User {
  id: number
  name: string
  email: string
}

export async function fetchUsersAction(
  companyId: number,
  search?: string
): Promise<CommonResponse<User[]> | ApiErrorResponse> {
  const queryParams = search ? `?query=${encodeURIComponent(search)}` : '?limit=50'
  return await handleServerAction<User[]>({
    url: `/company/${companyId}/users${queryParams}`,
    method: 'GET'
  })
}