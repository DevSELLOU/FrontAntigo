'fullName'
import { z } from 'zod'

export const RequestShopAccessSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  companyName: z.string().min(1, 'Nome da empresa é obrigatório'),
  email: z.string().email('Email inválido'),
  phoneNumber: z
    .string()
    .min(3, { message: 'Telefone é obrigatório' })
    .refine(val => /^\d{11}$/.test(val.replace(/\D/g, '')), { message: 'Número inválido' })
    .transform(val => val.replace(/\D/g, '')),
  cnpj: z
    .string()
    .min(1, { message: 'CNPJ é obrigatório' })
    .refine(val => /^\d{14}$/.test(val.replace(/\D/g, '')), { message: 'CNPJ inválido' })
    .transform(val => val.replace(/\D/g, ''))
})
