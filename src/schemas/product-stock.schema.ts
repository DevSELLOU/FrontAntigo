import { ProductStockType } from '@/enums/product-stock-type.enum'
import { z } from 'zod'

export const ProductStockSchema = z.object({
  type: z.nativeEnum(ProductStockType),
  productId: z.number(),
  quantity: z.string().min(1, { message: 'Informe a quantidade' })
})
