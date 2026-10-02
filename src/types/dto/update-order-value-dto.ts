import { UpdateOrderValueSchema } from '@/schemas/update-order-value.schema'
import { z } from 'zod'

export type UpdateOrderValueDto = z.infer<typeof UpdateOrderValueSchema>
