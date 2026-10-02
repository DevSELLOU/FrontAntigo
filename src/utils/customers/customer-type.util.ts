import { CustomerType } from '@/enums/customer-type.enum'

export const CUSTOMER_TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
  { value: CustomerType.Wholesale, label: 'Atacado' },
  { value: CustomerType.Resale, label: 'Revenda' },
  { value: CustomerType.EndConsumer, label: 'Consumidor Final' }
]

/**
 * Human label for a customer type. The profile header used to print the raw enum value, so a
 * wholesale customer was labelled `WHOLESALE` on screen.
 */
export function getCustomerTypeText(type: CustomerType | null | undefined): string {
  if (!type) return ''
  return CUSTOMER_TYPE_OPTIONS.find(option => option.value === type)?.label ?? type
}
