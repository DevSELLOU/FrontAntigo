'use server'

import { handleServerAction } from '@/utils/server-action.util'
import type { ScheduledVisit } from '@/interfaces/scheduled-visit.interface'

export async function createScheduledVisitAction(
  companyId: number,
  body: {
    customerId: number
    userId: number
    scheduledDate: string
    scheduledTime: string
    notes?: string
  }
) {
  return handleServerAction<ScheduledVisit>({
    url: `/company/${companyId}/routes-visits/scheduled-visits`,
    method: 'POST',
    body
  })
}
