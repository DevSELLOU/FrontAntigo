import { CustomerSchema } from '@/schemas/customer.schema'
import { z } from 'zod'

export type CustomerDto = z.infer<typeof CustomerSchema>
