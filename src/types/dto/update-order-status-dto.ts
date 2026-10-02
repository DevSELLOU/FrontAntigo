import { UpdateOrderStatusSchema } from '@/schemas/update-order-status.schema'
import { z } from 'zod'

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>
