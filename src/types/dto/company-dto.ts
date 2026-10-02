import { CompanySchema } from '@/schemas/company.schema'
import { z } from 'zod'

export type CompanyDto = z.infer<typeof CompanySchema>
