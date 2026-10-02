import { OrderStatus } from '@/enums/order-status.enum'

/**
 * Main workflow columns (left to right flow)
 * Orders can be dragged through these statuses following the allowed transitions
 */
export const KANBAN_MAIN_FLOW_ORDER: OrderStatus[] = [
  OrderStatus.OnBudget,
  OrderStatus.InApproval,
  OrderStatus.Approved,
  OrderStatus.Invoiced,
  OrderStatus.Dispatched,
  OrderStatus.Delivered,
  OrderStatus.Returned
]

/**
 * Terminal status columns
 * These are statuses orders can have but cannot transition to via drag
 * CANCELED is set through other business logic, not status updates
 */
export const KANBAN_TERMINAL_STATUSES: OrderStatus[] = [
  OrderStatus.Canceled
]

/**
 * Complete column order for display
 */
export const KANBAN_STATUS_ORDER: OrderStatus[] = [
  ...KANBAN_MAIN_FLOW_ORDER,
  ...KANBAN_TERMINAL_STATUSES
]

/**
 * Allowed status transitions according to backend rules
 * Backend updateStatus only handles these specific transitions
 * Note: BLOCKED is excluded from frontend as it's not manageable via status updates
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<Exclude<OrderStatus, OrderStatus.Blocked>, OrderStatus[]> = {
  [OrderStatus.OnBudget]: [OrderStatus.InApproval],
  [OrderStatus.InApproval]: [OrderStatus.Approved],
  [OrderStatus.Approved]: [OrderStatus.Invoiced],
  [OrderStatus.Invoiced]: [OrderStatus.Dispatched],
  [OrderStatus.Dispatched]: [OrderStatus.Delivered],
  [OrderStatus.Delivered]: [OrderStatus.Returned],
  [OrderStatus.Returned]: [],
  [OrderStatus.Canceled]: []
}

export const KANBAN_COLUMN_WIDTH = 320

export function canMoveStatus(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
  if (fromStatus === toStatus) {
    return false
  }

  // BLOCKED status cannot be changed via kanban
  if (fromStatus === OrderStatus.Blocked) {
    return false
  }

  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[fromStatus as Exclude<OrderStatus, OrderStatus.Blocked>]
  return allowedTransitions?.includes(toStatus) ?? false
}

export function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  if (currentStatus === OrderStatus.Blocked) {
    return null
  }

  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus as Exclude<OrderStatus, OrderStatus.Blocked>]
  return allowedTransitions?.[0] ?? null
}

export function getAllowedNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  if (currentStatus === OrderStatus.Blocked) {
    return []
  }

  return ALLOWED_STATUS_TRANSITIONS[currentStatus as Exclude<OrderStatus, OrderStatus.Blocked>] ?? []
}

export function getStatusIndex(status: OrderStatus): number {
  return KANBAN_STATUS_ORDER.indexOf(status)
}

export function isTerminalStatus(status: OrderStatus): boolean {
  if (status === OrderStatus.Blocked) {
    return true
  }

  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[status as Exclude<OrderStatus, OrderStatus.Blocked>]
  return allowedTransitions?.length === 0
}

/**
 * Check if a status is part of the main workflow (can transition to next)
 */
export function isMainFlowStatus(status: OrderStatus): boolean {
  return KANBAN_MAIN_FLOW_ORDER.includes(status)
}
