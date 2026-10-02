import { OrderStatus } from '@/enums/order-status.enum'

/**
 * Linear happy-path stages, matching the main Kanban flow (excludes the
 * exception statuses Returned/Canceled/Blocked, which get their own visual treatment).
 */
export const ORDER_STAGE_ORDER: OrderStatus[] = [
  OrderStatus.OnBudget,
  OrderStatus.InApproval,
  OrderStatus.Approved,
  OrderStatus.Invoiced,
  OrderStatus.Dispatched,
  OrderStatus.Delivered
]

export type OrderStageState =
  | { kind: 'stage'; index: number; total: number }
  | { kind: 'canceled' }
  | { kind: 'returned' }
  | { kind: 'blocked' }

export function getOrderStageState(status: OrderStatus): OrderStageState {
  if (status === OrderStatus.Canceled) return { kind: 'canceled' }
  if (status === OrderStatus.Returned) return { kind: 'returned' }
  if (status === OrderStatus.Blocked) return { kind: 'blocked' }

  const index = ORDER_STAGE_ORDER.indexOf(status)
  return { kind: 'stage', index: index === -1 ? 0 : index, total: ORDER_STAGE_ORDER.length }
}
