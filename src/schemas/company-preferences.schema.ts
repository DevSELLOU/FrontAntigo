import { z } from 'zod'

export const CompanyPreferencesSchema = z.object({
  logoUrl: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  customColor: z.string(),
  shopColor: z.string(),
  // The storefront identity block. Bounds mirror the DTO's `@MaxLength` on the backend, so an
  // over-long value is caught in the form instead of being rejected after a round trip.
  about: z.string().max(600, 'Máximo de 600 caracteres').optional(),
  whatsapp: z.string().max(30, 'Máximo de 30 caracteres').optional(),
  phone: z.string().max(30, 'Máximo de 30 caracteres').optional(),
  address: z.string().max(200, 'Máximo de 200 caracteres').optional(),
  businessHours: z.string().max(120, 'Máximo de 120 caracteres').optional(),
  allowOrdersWithoutStock: z.boolean().optional()
})
