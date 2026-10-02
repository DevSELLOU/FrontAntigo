import { SubCategorySchema } from '@/schemas/sub-category.schema'
import { z } from 'zod'

export type SubCategoryDto = z.infer<typeof SubCategorySchema>
