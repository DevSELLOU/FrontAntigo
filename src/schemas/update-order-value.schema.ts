import { z } from 'zod'

export const UpdateOrderValueSchema = z.object({
  amountPaid: z.number().positive({ message: 'O valor do pedido inválido' })
})
