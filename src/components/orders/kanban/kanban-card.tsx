'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Order } from '@/interfaces/order.interface'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { OrderCard } from '../mobile/order-card'

interface KanbanCardProps {
  order: Order
  orderWrapper: OrderWrapper
  isOverlay?: boolean
  onMutationSuccess?: () => void
}

/**
 * Adapts the shared OrderCard for the kanban board by attaching dnd-kit's
 * sortable bindings. The card layout itself is not duplicated here.
 */
export function KanbanCard({ order, orderWrapper, isOverlay, onMutationSuccess }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: order.id,
    data: {
      order,
      type: 'Order'
    }
  })

  return (
    <OrderCard
      order={order}
      orderWrapper={orderWrapper}
      onMutationSuccess={onMutationSuccess}
      drag={{
        setNodeRef,
        style: {
          transform: CSS.Transform.toString(transform),
          transition
        },
        attributes,
        listeners,
        isDragging,
        isOverlay
      }}
    />
  )
}
