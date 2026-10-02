import { OrderStatus } from '@/enums/order-status.enum'
import { z } from 'zod'

export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  returnReason: z.string().optional()
})
