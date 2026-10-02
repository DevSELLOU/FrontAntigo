import { OrderStatus } from '@/enums/order-status.enum'

export function getOrderStatusText(type: OrderStatus): string {
  return {
    ON_BUDGET: 'Em orçamento',
    IN_APPROVAL: 'Em aprovação',
    APPROVED: 'Aprovado',
    INVOICED: 'Faturado',
    DISPATCHED: 'Expedido',
    DELIVERED: 'Entregue',
    RETURNED: 'Devolvido',
    CANCELED: 'Cancelado',
    BLOCKED: 'Bloqueado',
  }[type]
}
