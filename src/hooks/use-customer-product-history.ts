'use client'

import { useEffect, useState } from 'react'

import { fetchCustomerProductHistoryAction } from '@/actions/order/fetch-customer-product-history.action'
import type { CustomerProductHistoryItem } from '@/interfaces/customer-product-history.interface'

interface UseCustomerProductHistoryParams {
  companyId: number
  customerId?: number | null
  /** Pedido em edição — não deve contar como compra anterior do próprio cliente. */
  excludeOrderId?: number
}

export interface CustomerProductHistoryState {
  /** Histórico indexado por productId, para cruzar com a lista de produtos exibida. */
  byProductId: Map<number, CustomerProductHistoryItem>
  windowDays: number
  isLoading: boolean
  /** Falhou ao carregar: a tela segue utilizável, apenas sem o histórico. */
  hasFailed: boolean
}

const EMPTY: CustomerProductHistoryState = {
  byProductId: new Map(),
  windowDays: 45,
  isLoading: false,
  hasFailed: false
}

/**
 * Carrega o histórico de compra do cliente selecionado, agregado por produto.
 *
 * Busca tudo de uma vez e indexa por produto, em vez de consultar produto a
 * produto: mantém uma requisição só e continua funcionando se a lista de
 * produtos passar a ser paginada/buscada no servidor.
 */
export function useCustomerProductHistory({
  companyId,
  customerId,
  excludeOrderId
}: UseCustomerProductHistoryParams): CustomerProductHistoryState {
  const [state, setState] = useState<CustomerProductHistoryState>(EMPTY)

  useEffect(() => {
    if (!customerId) {
      setState(EMPTY)
      return
    }

    let isCurrent = true
    setState(prev => ({ ...prev, isLoading: true, hasFailed: false }))

    fetchCustomerProductHistoryAction(companyId, customerId, { excludeOrderId })
      .then(response => {
        if (!isCurrent) return

        if ('data' in response) {
          setState({
            byProductId: new Map(response.data.items.map(item => [item.productId, item])),
            windowDays: response.data.windowDays,
            isLoading: false,
            hasFailed: false
          })
          return
        }

        // Sem histórico o vendedor ainda precisa conseguir montar o pedido.
        setState({ ...EMPTY, hasFailed: true })
      })
      .catch(() => {
        if (!isCurrent) return
        setState({ ...EMPTY, hasFailed: true })
      })

    return () => {
      isCurrent = false
    }
  }, [companyId, customerId, excludeOrderId])

  return state
}
