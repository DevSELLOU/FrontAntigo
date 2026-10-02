import { ChangePasswordSchema } from '@/schemas/change-password.schema'
import { z } from 'zod'

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>
