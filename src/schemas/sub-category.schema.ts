import { z } from 'zod'

export const SubCategorySchema = z.object({
  name: z.string().min(2, { message: 'Nome é obrigatório' })
})
