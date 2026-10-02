import { describe, expect, it } from 'vitest'
import { CustomerSchema } from './customer.schema'

function buildValidCustomer(overrides: Record<string, unknown> = {}) {
  return CustomerSchema.parse({
    corporateName: 'Empresa LTDA',
    fantasyName: 'Empresa',
    document: '12345678000190',
    creditLimit: 1000,
    cep: '01001000',
    address: 'Rua A, 123',
    city: 'São Paulo',
    UF: 'SP',
    neighborhood: 'Centro',
    email: 'contato@empresa.com.br',
    phoneNumber: '11999999999',
    subSegmentId: '1',
    paymentConditionIds: [1],
    paymentMethodsIds: [1],
    ...overrides
  })
}

describe('CustomerSchema', () => {
  it('accepts a valid customer without sellerIds', () => {
    const result = buildValidCustomer()
    expect(result.sellerIds).toBeUndefined()
  })

  it('accepts sellerIds with valid numbers', () => {
    const result = buildValidCustomer({ sellerIds: [1, 2] })
    expect(result.sellerIds).toEqual([1, 2])
  })

  it('accepts an empty sellerIds array', () => {
    const result = buildValidCustomer({ sellerIds: [] })
    expect(result.sellerIds).toEqual([])
  })

  it('rejects sellerIds with a non-number entry', () => {
    expect(() => buildValidCustomer({ sellerIds: [1, 'x'] })).toThrow()
  })

  it('rejects sellerIds when it is not an array', () => {
    expect(() => buildValidCustomer({ sellerIds: 5 })).toThrow()
  })

  it('accepts undefined sellerIds while still validating required fields', () => {
    const result = buildValidCustomer({ sellerIds: undefined })
    expect(result.corporateName).toBe('Empresa LTDA')
  })
})
