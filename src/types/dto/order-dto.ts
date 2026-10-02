import { OrderSchema } from '@/schemas/order.schema'
import { z } from 'zod'

export type OrderDto = z.infer<typeof OrderSchema>
