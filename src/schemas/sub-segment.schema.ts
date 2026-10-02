import { z } from 'zod'

export const SubSegmentSchema = z.object({
  name: z.string().min(2, { message: 'Nome é obrigatório' })
})
