import { UserCompanySchema } from '@/schemas/user-company.schema'
import { z } from 'zod'

export type UserCompanyDto = z.infer<typeof UserCompanySchema>
