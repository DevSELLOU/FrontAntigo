import { CompanyPreferencesSchema } from '@/schemas/company-preferences.schema'
import { z } from 'zod'

export type CompanyPreferencesDto = z.infer<typeof CompanyPreferencesSchema>
