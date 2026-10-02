export interface CustomerProductHistoryItem {
  productId: number
  /** ISO date (YYYY-MM-DD) da última compra confirmada. */
  lastPurchaseAt: string
  lastPurchaseQuantity: number
  /** Quantidade comprada dentro da janela consultada (padrão: 45 dias). */
  quantityInWindow: number
  totalQuantity: number
  orderCount: number
}

export interface CustomerProductHistory {
  windowDays: number
  items: CustomerProductHistoryItem[]
}
