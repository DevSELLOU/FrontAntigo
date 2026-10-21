import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/server-action.util', () => ({ handleServerAction: vi.fn() }))
import { handleServerAction } from '@/utils/server-action.util'
import { fetchUsersAction } from './fetch-users.action'

describe('company user selector contract', () => {
  beforeEach(() => vi.resetAllMocks())

  it('uses the user ID and company role instead of the membership ID', async () => {
    vi.mocked(handleServerAction).mockResolvedValue({
      message: 'ok',
      data: [
        {
          id: 99,
          userId: 7,
          role: 'SALES_REP',
          status: 'ACTIVE',
          user: { id: 7, name: 'Vendedor fictício', email: 'ficticio@example.test', password: 'must-not-forward' }
        }
      ]
    } as any)
    const result = await fetchUsersAction(1)
    expect(result).toEqual({
      message: 'ok',
      data: [{ id: 7, name: 'Vendedor fictício', email: 'ficticio@example.test', role: 'SALES_REP', status: 'ACTIVE' }]
    })
  })

  it('keeps compatibility with flat user responses', async () => {
    vi.mocked(handleServerAction).mockResolvedValue({
      message: 'ok',
      data: [{ id: 7, name: 'Fictício', email: 'ficticio@example.test' }]
    } as any)
    const result = await fetchUsersAction(1)
    expect('data' in result && result.data?.[0].id).toBe(7)
  })

  it('preserves permission errors', async () => {
    vi.mocked(handleServerAction).mockResolvedValue({ message: 'Sem permissão', statusCode: 403 })
    expect(await fetchUsersAction(1)).toEqual({ message: 'Sem permissão', statusCode: 403 })
  })
})
