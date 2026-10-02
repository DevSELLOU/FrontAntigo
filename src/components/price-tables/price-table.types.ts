export interface RuleFormData {
  id?: number
  priority: number
  field: string
  operator: string
  value: string
  values?: string[]
  minimumOrderValue?: string
  adjustmentType?: 'PERCENTAGE_DISCOUNT' | 'PERCENTAGE_MARKUP' | 'FIXED_VALUE'
  adjustmentValue?: string
}