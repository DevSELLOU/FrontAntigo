'use server'

import { AccessRequests } from '@/interfaces/access-requests.interface'
import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { UpdateAccessRequestStatusDto } from '@/types/dto/update-access-request-status-dto'
import { handleServerAction } from '@/utils/server-action.util'
import { revalidateTag } from 'next/cache'

export async function updateAccessRequestStatusAction(
  companyId: number,
  accessRequestId: number,
  actionDto: UpdateAccessRequestStatusDto
): Promise<CommonResponse<AccessRequests> | ApiErrorResponse> {
  const response = await handleServerAction<AccessRequests>({
    url: `/company/${companyId}/access-requests/${accessRequestId}/status`,
    method: 'PATCH',
    body: actionDto
  })

  revalidateTag(`/company/${companyId}/access-requests`)

  return response
}
