'use server'

import type { CustomerProductHistory } from '@/interfaces/customer-product-history.interface'
import { handleServerAction } from '@/utils/server-action.util'

/**
 * Histórico de compra do cliente agregado por produto, usado para orientar
 * a reposição enquanto o vendedor monta o pedido.
 *
 * `excludeOrderId` evita que o pedido em edição conte como compra anterior
 * do próprio cliente.
 */
export async function fetchCustomerProductHistoryAction(
  companyId: number,
  customerId: number,
  options: { windowDays?: number; excludeOrderId?: number } = {}
): Promise<{ data: CustomerProductHistory } | { message: string; statusCode?: number }> {
  const params = new URLSearchParams()
  if (options.windowDays) params.set('windowDays', String(options.windowDays))
  if (options.excludeOrderId) params.set('excludeOrderId', String(options.excludeOrderId))

  const suffix = params.toString() ? `?${params.toString()}` : ''

  const response = await handleServerAction<CustomerProductHistory>({
    url: `/company/${companyId}/orders/customer-history/${customerId}${suffix}`,
    method: 'GET'
  })

  if ('data' in response && response.data) {
    return { data: response.data }
  }

  return {
    message: 'message' in response ? response.message : 'Erro desconhecido',
    statusCode: 'statusCode' in response ? response.statusCode : 500
  }
}
