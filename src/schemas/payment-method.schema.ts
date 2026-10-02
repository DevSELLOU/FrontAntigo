import { z } from 'zod'

export const PaymentMethodSchema = z.object({
  name: z.string().min(2, { message: 'Nome é obrigatório' }),
  description: z.string().optional()
})
