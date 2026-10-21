'use server'

import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { handleServerAction } from '@/utils/server-action.util'

interface User {
  id: number
  name: string
  email: string
  role?: string
  status?: string
}

interface CompanyUser {
  userId: number
  role: string
  status: string
  user: User
}

export async function fetchUsersAction(
  companyId: number,
  search?: string
): Promise<CommonResponse<User[]> | ApiErrorResponse> {
  const queryParams = search ? `?query=${encodeURIComponent(search)}` : '?limit=50'
  const response = await handleServerAction<(User | CompanyUser)[]>({
    url: `/company/${companyId}/users${queryParams}`,
    method: 'GET'
  })

  if (!('data' in response)) return response

  return {
    ...response,
    data: (response.data || []).map(row => {
      const user = 'user' in row ? row.user : row

      return {
        id: 'user' in row ? row.userId : user.id,
        name: user.name,
        email: user.email,
        role: row.role,
        status: row.status
      }
    })
  }
}
