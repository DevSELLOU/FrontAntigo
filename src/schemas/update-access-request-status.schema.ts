import { AccessRequestStatus } from '@/enums/access-request-status.enum'
import { z } from 'zod'

export const UpdateAccessRequestStatusSchema = z.object({
  status: z.nativeEnum(AccessRequestStatus),
  customerId: z.coerce.number().optional()
})
