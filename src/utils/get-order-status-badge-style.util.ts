import { OrderStatus } from '@/enums/order-status.enum'

export function getOrderStatusBadgeStyle(status: OrderStatus): React.CSSProperties {
  return (
    {
      ON_BUDGET: { backgroundColor: 'var(--status-on-budget-bg)', color: 'var(--status-on-budget-fg)' },
      IN_APPROVAL: { backgroundColor: 'var(--status-in-approval-bg)', color: 'var(--status-in-approval-fg)' },
      APPROVED: { backgroundColor: 'var(--status-approved-bg)', color: 'var(--status-approved-fg)' },
      INVOICED: { backgroundColor: 'var(--status-invoiced-bg)', color: 'var(--status-invoiced-fg)' },
      DISPATCHED: { backgroundColor: 'var(--status-dispatched-bg)', color: 'var(--status-dispatched-fg)' },
      DELIVERED: { backgroundColor: 'var(--status-delivered-bg)', color: 'var(--status-delivered-fg)' },
      RETURNED: { backgroundColor: 'var(--status-returned-bg)', color: 'var(--status-returned-fg)' },
      CANCELED: { backgroundColor: 'var(--status-canceled-bg)', color: 'var(--status-canceled-fg)' },
      BLOCKED: { backgroundColor: 'var(--status-blocked-bg)', color: 'var(--status-blocked-fg)' },
    }[status] || { backgroundColor: 'var(--status-on-budget-bg)', color: 'var(--status-on-budget-fg)' }
  )
}
