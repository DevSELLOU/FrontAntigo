import { z } from 'zod'

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8, { message: 'Senha deve ter no mínimo 8 caracteres' }),
  newPassword: z.string().min(8, { message: 'Senha deve ter no mínimo 8 caracteres' }),
  passwordConfirmation: z.string().min(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
})
