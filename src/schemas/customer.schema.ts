import { CountryState } from '@/enums/country-state.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { CustomerType } from '@/enums/customer-type.enum'
import { z } from 'zod'

export const CustomerSchema = z.object({
  corporateName: z.string().min(3, { message: 'Razão Social é obrigatório' }),
  fantasyName: z.string().min(3, { message: 'Nome Fantasia é obrigatório' }),
  address: z.string().min(3, { message: 'Endereço é obrigatório' }),
  city: z.string().min(3, { message: 'Cidade é obrigatório' }),
  UF: z.nativeEnum(CountryState),
  neighborhood: z.string().min(3, { message: 'Bairro é obrigatório' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  url: z.string().optional(),
  observations: z.string().optional(),
  creditLimit: z.number().positive({ message: 'Limite de Crédito é obrigatório' }),
  gln: z
    .string()
    .refine(val => val === '' || val.length === 13, { message: 'GLN precisa conter 13 dígitos' })
    .optional()
    .nullable(),
  subSegmentId: z.string().min(1, { message: 'O segmento é obrigatório' }),
  stateRegistration: z.string().optional(),
  paymentConditionIds: z.array(
    z.number({
      message: 'Condições de pagamento inválidas'
    }),
    { required_error: 'Condições de pagamento são obrigatórias' }
  ),
  paymentMethodsIds: z.array(
    z.number({
      message: 'Métodos de pagamento inválidos'
    }),
    { required_error: 'Métodos de pagamento são obrigatórios' }
  ),
  sellerIds: z.array(z.number()).optional(),
  cep: z
    .string()
    .min(8, { message: 'CEP é obrigatório' })
    .refine(val => /^\d{8}$/.test(val.replace(/\D/g, '')), { message: 'CEP inválido' })
    .transform(val => val.replace(/\D/g, '')),
  document: z
    .string()
    .min(1, { message: 'CPF/CNPJ é obrigatório' })
    .refine(val => /^\d{11}$/.test(val.replace(/\D/g, '')) || /^\d{14}$/.test(val.replace(/\D/g, '')), {
      message: 'CPF/CNPJ inválido'
    })
    .transform(val => val.replace(/\D/g, '')),
  phoneNumber: z
    .string()
    .min(3, { message: 'Telefone é obrigatório' })
    .refine(val => /^\d{11}$/.test(val.replace(/\D/g, '')), { message: 'Número inválido' })
    .transform(val => val.replace(/\D/g, '')),
  status: z.nativeEnum(CustomerStatus).optional(),
  customerType: z.nativeEnum(CustomerType).optional(),
  tags: z.array(z.string()).optional(),
  primaryContactName: z.string().optional(),
  emails: z.array(z.string().email({ message: 'E-mail inválido' })).optional(),
  phones: z.array(z.string()).optional(),
  billingAddress: z
    .object({
      postalCode: z.string().min(8, { message: 'CEP é obrigatório' }),
      street: z.string().min(1, { message: 'Rua é obrigatória' }),
      neighborhood: z.string().min(1, { message: 'Bairro é obrigatório' }),
      city: z.string().min(1, { message: 'Cidade é obrigatória' }),
      state: z.string().min(1, { message: 'Estado é obrigatório' }),
      number: z.string().min(1, { message: 'Número é obrigatório' }),
      complement: z.string().optional()
    })
    .optional(),
  shippingAddress: z
    .object({
      postalCode: z.string().min(8, { message: 'CEP é obrigatório' }),
      street: z.string().min(1, { message: 'Rua é obrigatória' }),
      neighborhood: z.string().min(1, { message: 'Bairro é obrigatório' }),
      city: z.string().min(1, { message: 'Cidade é obrigatória' }),
      state: z.string().min(1, { message: 'Estado é obrigatório' }),
      number: z.string().min(1, { message: 'Número é obrigatório' }),
      complement: z.string().optional()
    })
    .optional()
})
