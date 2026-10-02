import { z } from 'zod'

export const CompanySchema = z.object({
  corporateName: z.string().min(1, { message: 'Razão social é obrigatório' }),
  fantasyName: z.string().min(1, { message: 'Nome fantasia é obrigatório' }),
  cnpj: z
    .string()
    .min(1, { message: 'CNPJ é obrigatório' })
    .refine(val => /^\d{14}$/.test(val.replace(/\D/g, '')), { message: 'CNPJ inválido' })
    .transform(val => val.replace(/\D/g, ''))
})
