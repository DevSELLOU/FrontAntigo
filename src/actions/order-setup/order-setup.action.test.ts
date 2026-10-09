import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleServerAction } from '@/utils/server-action.util'
import { getOrderSetupAction } from './order-setup.action'

vi.mock('@/utils/server-action.util', () => ({ handleServerAction: vi.fn() }))

describe('getOrderSetupAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('unwraps the existing list response and preserves a zero-day minimum', async () => {
    const setup = { id: 9, companyId: 1, minDays: 0, maxDays: 30 }
    vi.mocked(handleServerAction).mockResolvedValue({ message: 'ok', data: [setup], metadata: { total: 1 } } as any)
    expect(await getOrderSetupAction(1, 'shop-token')).toEqual({ message: 'ok', data: setup })
    expect(handleServerAction).toHaveBeenCalledWith({ url: '/company/1/order-setup', method: 'GET', shopAccessToken: 'shop-token' })
  })

  it('returns an explicit error when the company has no configuration', async () => {
    vi.mocked(handleServerAction).mockResolvedValue({ message: 'ok', data: [] })
    expect(await getOrderSetupAction(1)).toMatchObject({ statusCode: 404 })
  })

  it('preserves API errors instead of treating them as configurations', async () => {
    const error = { statusCode: 403, message: 'Sem permissão' }
    vi.mocked(handleServerAction).mockResolvedValue(error)
    expect(await getOrderSetupAction(1)).toBe(error)
  })
})
