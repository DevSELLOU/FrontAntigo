import { describe, expect, it } from 'vitest'
import { OrderSchema } from './order.schema'

function buildValidOrder(overrides: Record<string, unknown> = {}) {
  return OrderSchema.parse({
    observation: 'entrega na parte da manhã',
    paymentConditionId: '1',
    paymentMethodId: '2',
    customerId: '10',
    discount: 0,
    isBudget: false,
    responsibleUserIds: [1],
    items: [{ productId: 5, quantity: 2 }],
    ...overrides
  })
}

function buildOrderWithoutResponsibleUsers(overrides: Record<string, unknown> = {}) {
  return {
    observation: 'x',
    paymentConditionId: '1',
    paymentMethodId: '2',
    customerId: '10',
    discount: 0,
    isBudget: false,
    items: [{ productId: 5, quantity: 2 }],
    ...overrides
  }
}

describe('OrderSchema', () => {
  it('accepts a valid order', () => {
    const result = buildValidOrder()
    expect(result.responsibleUserIds).toEqual([1])
  })

  it('accepts an empty responsibleUserIds array', () => {
    const result = buildValidOrder({ responsibleUserIds: [] })
    expect(result.responsibleUserIds).toEqual([])
  })

  it('accepts multiple responsible users', () => {
    const result = buildValidOrder({ responsibleUserIds: [1, 2, 3] })
    expect(result.responsibleUserIds).toEqual([1, 2, 3])
  })

  it('rejects responsibleUserIds when it is missing', () => {
    expect(() => OrderSchema.parse(buildOrderWithoutResponsibleUsers())).toThrow()
  })

  it('rejects responsibleUserIds with a non-number entry', () => {
    expect(() => OrderSchema.parse(buildOrderWithoutResponsibleUsers({ responsibleUserIds: ['abc'] }))).toThrow()
  })

  it('rejects responsibleUserIds when it is not an array', () => {
    expect(() => OrderSchema.parse(buildOrderWithoutResponsibleUsers({ responsibleUserIds: 1 }))).toThrow()
  })

  it('preserves the responsible users when other fields are overridden', () => {
    const result = buildValidOrder({ discount: 25 })
    expect(result.discount).toBe(25)
    expect(result.responsibleUserIds).toEqual([1])
  })
})
