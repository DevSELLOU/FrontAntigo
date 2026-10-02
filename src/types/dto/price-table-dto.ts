import { PriceTableSchema } from '@/schemas/price-table.schema'
import { z } from 'zod'

export const PriceTableFormSchema = PriceTableSchema.extend({
  adjustmentValue: z.union([z.string(), z.number()]).optional(),
})

export type PriceTableDto = z.infer<typeof PriceTableFormSchema>
