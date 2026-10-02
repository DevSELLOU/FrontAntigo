import { describe, expect, it } from 'vitest'
import { CustomerType } from '@/enums/customer-type.enum'
import { CUSTOMER_TYPE_OPTIONS, getCustomerTypeText } from './customer-type.util'

describe('getCustomerTypeText', () => {
  it('labels every type in the enum', () => {
    expect(getCustomerTypeText(CustomerType.Wholesale)).toBe('Atacado')
    expect(getCustomerTypeText(CustomerType.Resale)).toBe('Revenda')
    expect(getCustomerTypeText(CustomerType.EndConsumer)).toBe('Consumidor Final')
  })

  it('covers the whole enum, so a new type cannot slip through unlabelled', () => {
    expect(CUSTOMER_TYPE_OPTIONS.map(option => option.value).sort()).toEqual(Object.values(CustomerType).sort())
  })

  it('returns an empty string when the customer has no type', () => {
    expect(getCustomerTypeText(null)).toBe('')
    expect(getCustomerTypeText(undefined)).toBe('')
  })

  it('echoes back an unknown value rather than rendering nothing', () => {
    expect(getCustomerTypeText('FRANCHISE' as CustomerType)).toBe('FRANCHISE')
  })
})
