import { z } from 'zod'

const RuleConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['EQUALS', 'CONTAINS', 'IN', 'GREATER_THAN_OR_EQUALS']),
  value: z.union([z.string(), z.number(), z.array(z.string())]),
})

const PriceTableRuleSchema = z.object({
  id: z.number().optional(),
  priority: z.number().optional(),
  conditions: z.array(RuleConditionSchema).optional(),
  adjustmentType: z.enum(['PERCENTAGE_DISCOUNT', 'PERCENTAGE_MARKUP', 'FIXED_VALUE']).optional(),
  adjustmentValue: z.number().optional(),
})

export const PriceTableSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  description: z.string().min(1, { message: 'Descrição é obrigatória' }),
  adjustmentType: z.enum(['PERCENTAGE_DISCOUNT', 'PERCENTAGE_MARKUP', 'FIXED_VALUE']).optional(),
  adjustmentValue: z.union([z.string(), z.number()]).optional(),
  rules: z.array(PriceTableRuleSchema).optional(),
})
