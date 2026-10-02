import { PaymentMethodSchema } from '@/schemas/payment-method.schema'
import { z } from 'zod'

export type PaymentMethodDto = z.infer<typeof PaymentMethodSchema>
