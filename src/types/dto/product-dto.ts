import { ProductSchema } from '@/schemas/product.schema'
import { z } from 'zod'

export type ProductDto = z.infer<typeof ProductSchema>
