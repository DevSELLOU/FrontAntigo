import { PaymentConditionSchema } from '@/schemas/payment-condition.schema'
import { z } from 'zod'

export type PaymentConditionDto = z.infer<typeof PaymentConditionSchema>
