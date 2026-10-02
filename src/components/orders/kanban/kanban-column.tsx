'use client'

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { OrderStatus } from '@/enums/order-status.enum'
import { Order } from '@/interfaces/order.interface'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { getOrderStatusBadgeStyle } from '@/utils/get-order-status-badge-style.util'
import { getOrderStatusText } from '@/utils/get-order-status-text.util'
import { Badge } from '@/components/ui/badge'
import { KanbanCard } from './kanban-card'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  status: OrderStatus
  orders: Order[]
  orderWrapper: OrderWrapper
  isValidDropTarget?: boolean
  isCurrentColumn?: boolean
  isDragging?: boolean
  onMutationSuccess?: () => void
}

export function KanbanColumn({
  status,
  orders,
  orderWrapper,
  isValidDropTarget = false,
  isCurrentColumn = false,
  isDragging = false,
  onMutationSuccess
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: {
      status,
      type: 'Column'
    }
  })

  const statusText = getOrderStatusText(status)
  const statusStyle = getOrderStatusBadgeStyle(status)

  const getColumnStyles = () => {
    if (isOver && isValidDropTarget) {
      return 'border-brand-600 bg-success ring-2 ring-inset ring-brand-600/35'
    }
    if (isOver && !isValidDropTarget && !isCurrentColumn) {
      return 'border-danger-border bg-danger'
    }
    if (isValidDropTarget && isDragging) {
      return 'border-dashed border-brand-500 bg-brand-50'
    }
    if (isCurrentColumn && isDragging) {
      return 'border-border-strong bg-surface-muted'
    }
    return 'border-border bg-surface-muted'
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col w-[300px] min-w-[300px] max-w-[300px] overflow-hidden rounded-lg border shadow-card transition-colors',
        getColumnStyles()
      )}
    >
      <div className='border-b border-border bg-surface p-3'>
        <div className='flex items-center justify-between gap-2'>
          <Badge className='rounded-full font-semibold shadow-none' style={statusStyle}>
            {statusText}
          </Badge>
          <span className='rounded-full bg-surface-muted px-2 py-0.5 text-caption font-semibold tabular-nums text-text-muted'>
            {orders.length}
          </span>
        </div>
      </div>

      <div className='flex-1 p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto'>
        <SortableContext
          items={orders.map(order => order.id)}
          strategy={verticalListSortingStrategy}
        >
          {orders.map(order => (
            <KanbanCard
              key={order.id}
              order={order}
              orderWrapper={orderWrapper}
              onMutationSuccess={onMutationSuccess}
            />
          ))}
        </SortableContext>

        {orders.length === 0 && (
          <p className='pt-6 text-center text-caption text-text-muted'>Nenhum pedido aqui.</p>
        )}
      </div>
    </div>
  )
}
