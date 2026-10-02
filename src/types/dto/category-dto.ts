import { CategorySchema } from '@/schemas/category.schema'
import { z } from 'zod'

export type CategoryDto = z.infer<typeof CategorySchema>
