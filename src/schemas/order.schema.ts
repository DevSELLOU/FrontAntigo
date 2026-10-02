import { z } from 'zod'

export const OrderSchema = z.object({
  observation: z.string(),
  paymentConditionId: z.string().min(1, { message: 'A condição de pagamento é obrigatória' }),
  paymentMethodId: z.string().min(1, { message: 'O método de pagamento é obrigatório' }),
  customerId: z.string().min(1, { message: 'O cliente é obrigatório' }),
  discount: z.number(),
  isBudget: z.boolean(),
  responsibleUserIds: z.array(z.number()),
  programmedDate: z.date().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().min(1, { message: 'O ID do produto é obrigatório' }),
        quantity: z.number().min(1, { message: 'A quantidade do produto é obrigatória' })
      })
    )
    .min(1, { message: 'Deve haver pelo menos um item no pedido' })
})
