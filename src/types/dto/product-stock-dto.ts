import { ProductStockSchema } from '@/schemas/product-stock.schema'
import { z } from 'zod'

export type ProductStockDto = z.infer<typeof ProductStockSchema>
