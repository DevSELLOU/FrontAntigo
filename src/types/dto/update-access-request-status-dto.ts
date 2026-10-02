import { UpdateAccessRequestStatusSchema } from '@/schemas/update-access-request-status.schema'
import { z } from 'zod'

export type UpdateAccessRequestStatusDto = z.infer<typeof UpdateAccessRequestStatusSchema>
