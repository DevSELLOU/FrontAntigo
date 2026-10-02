'use client'

import { updateOrderStatusAction } from '@/actions/order/update-order-status.action'
import { Loading } from '@/components/loading'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { OrderStatus } from '@/enums/order-status.enum'
import { useToast } from '@/hooks/use-toast'
import { Order } from '@/interfaces/order.interface'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import {
  canMoveStatus,
  getAllowedNextStatuses,
  isMainFlowStatus,
  KANBAN_STATUS_ORDER
} from '@/utils/kanban-status-order.util'
import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { KanbanCard } from './kanban-card'
import { KanbanColumn } from './kanban-column'

const KanbanInvoiceModal = dynamic(
  () => import('@/components/orders/common/kanban-invoice-modal').then(m => m.KanbanInvoiceModal),
  {
    ssr: false
  }
)

interface KanbanBoardProps {
  orderWrapper: OrderWrapper
}

export function KanbanBoard({ orderWrapper }: KanbanBoardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>(orderWrapper.orders)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isReloading] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    order: Order
    newStatus: OrderStatus
  } | null>(null)
  const [returnReason, setReturnReason] = useState('')
  const [statusModalOrder, setStatusModalOrder] = useState<Order | null>(null)

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setOrders(orderWrapper.orders)
  }, [orderWrapper.orders])

  const reloadOrders = useCallback(async () => {
    startTransition(() => {
      router.refresh()
    })
  }, [router])

  const columns = useMemo(() => {
    return KANBAN_STATUS_ORDER.map(status => ({
      status,
      orders: orders.filter(order => order.status === status)
    }))
  }, [orders])

  const getValidDropTargets = useCallback((order: Order | null): OrderStatus[] => {
    if (!order) return []
    return getAllowedNextStatuses(order.status)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5
      }
    })
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const orderId = active.id as number
      const order = orders.find(o => o.id === orderId)
      if (order) {
        setActiveOrder(order)
      }
    },
    [orders]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      setActiveOrder(null)

      if (!over) return

      const activeId = active.id as number
      const overId = over.id

      const activeOrderData = orders.find(o => o.id === activeId)
      if (!activeOrderData) return

      let overStatus: OrderStatus | null = null

      if (Object.values(OrderStatus).includes(overId as OrderStatus)) {
        overStatus = overId as OrderStatus
      } else {
        const overOrder = orders.find(o => o.id === overId)
        if (overOrder) {
          overStatus = overOrder.status
        }
      }

      if (!overStatus || activeOrderData.status === overStatus) return

      const canMove = canMoveStatus(activeOrderData.status, overStatus)

      if (!canMove) {
        const allowedStatuses = getAllowedNextStatuses(activeOrderData.status)
        const allowedText =
          allowedStatuses.length > 0
            ? allowedStatuses
                .map(s => {
                  const statusMap: Record<string, string> = {
                    ON_BUDGET: 'Em orçamento',
                    IN_APPROVAL: 'Em aprovação',
                    APPROVED: 'Aprovado',
                    INVOICED: 'Faturado',
                    DISPATCHED: 'Expedido',
                    DELIVERED: 'Entregue',
                    RETURNED: 'Devolvido',
                    CANCELED: 'Cancelado'
                  }
                  return statusMap[s] || s
                })
                .join(', ')
            : 'nenhum (status final)'

        toast({
          title: `Movimento não permitido. Status permitidos: ${allowedText}`,
          status: 'error'
        })
        return
      }

      if (overStatus === OrderStatus.Returned) {
        setPendingStatusChange({
          order: activeOrderData,
          newStatus: overStatus
        })
        setReturnReason('')
        return
      }

      if (overStatus === OrderStatus.Invoiced && activeOrderData.status === OrderStatus.Approved) {
        setStatusModalOrder(activeOrderData)
        return
      }

      executeStatusChange(activeOrderData, overStatus)
    },
    [orders, toast]
  )

  const executeStatusChange = async (order: Order, newStatus: OrderStatus, reason?: string) => {
    setIsUpdating(true)

    try {
      const response = await updateOrderStatusAction(orderWrapper.companyId, order.id, {
        status: newStatus,
        returnReason: reason || ''
      })

      if (isApiErrorResponse(response)) {
        toast({
          title: `Erro ao atualizar status: ${response.message}`,
          status: 'error'
        })
        return
      }

      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === order.id ? { ...o, status: newStatus, returnReason: reason || o.returnReason } : o
        )
      )

      toast({
        title: 'Status do pedido atualizado com sucesso',
        status: 'success'
      })
    } catch {
      toast({
        title: 'Erro ao atualizar status do pedido',
        status: 'error'
      })
    } finally {
      setIsUpdating(false)
      setPendingStatusChange(null)
      setReturnReason('')
    }
  }

  const handleConfirmReturn = () => {
    if (!pendingStatusChange) return

    if (!returnReason.trim()) {
      toast({
        title: 'Por favor, informe o motivo da devolução',
        status: 'error'
      })
      return
    }

    executeStatusChange(pendingStatusChange.order, pendingStatusChange.newStatus, returnReason)
  }

  const handleCancelReturn = () => {
    setPendingStatusChange(null)
    setReturnReason('')
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  const validDropTargets = getValidDropTargets(activeOrder)

  return (
    <div className='relative w-full'>
      {(isUpdating || isReloading || isPending) && (
        <div
          role='status'
          aria-live='polite'
          className='absolute inset-0 z-50 flex items-center justify-center gap-2 rounded-lg bg-app/70 backdrop-blur-[1px]'
        >
          <Loading className='ml-0 h-6 w-6 text-primary' />
          <span className='text-caption text-text-muted'>Atualizando pedidos...</span>
        </div>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <ScrollArea className='w-full whitespace-nowrap'>
          <div className='flex gap-4 pb-4'>
            {columns.map((column, index) => {
              const isValidDropTarget = validDropTargets.includes(column.status)
              const isCurrentColumn = activeOrder?.status === column.status
              const isMainFlow = isMainFlowStatus(column.status)
              const isFirstTerminal = !isMainFlow && index > 0 && isMainFlowStatus(columns[index - 1].status)

              return (
                <div key={column.status} className='flex items-start gap-4'>
                  {isFirstTerminal && (
                    <div className='flex flex-col items-center justify-center h-full min-h-[200px] px-2'>
                      <div className='w-px h-16 bg-border-strong'></div>
                      <span className='text-eyebrow text-text-muted whitespace-nowrap py-2 uppercase'>
                        Status finais
                      </span>
                      <div className='w-px h-16 bg-border-strong'></div>
                    </div>
                  )}
                  <KanbanColumn
                    status={column.status}
                    orders={column.orders}
                    orderWrapper={orderWrapper}
                    isValidDropTarget={isValidDropTarget}
                    isCurrentColumn={isCurrentColumn}
                    isDragging={!!activeOrder}
                    onMutationSuccess={reloadOrders}
                  />
                </div>
              )
            })}
          </div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeOrder ? <KanbanCard order={activeOrder} orderWrapper={orderWrapper} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <Dialog open={!!pendingStatusChange} onOpenChange={() => handleCancelReturn()}>
        <DialogContent className='h-auto rounded-3xl border-border bg-surface sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-h2 text-text'>Motivo da devolução</DialogTitle>
            <DialogDescription className='text-body text-text-muted'>
              Informe o motivo da devolução do pedido #{pendingStatusChange?.order.id}.
            </DialogDescription>
          </DialogHeader>

          <div className='py-4'>
            <Label htmlFor='return-reason' className='text-label text-text-body'>
              Motivo da devolução
            </Label>
            <Textarea
              id='return-reason'
              placeholder='Descreva o motivo da devolução...'
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              className='min-h-[100px] mt-2'
            />
          </div>

          <DialogFooter>
            <Button variant='secondary' onClick={handleCancelReturn} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmReturn} disabled={isUpdating}>
              Confirmar
              {isUpdating && <Loading />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {statusModalOrder && (
        <KanbanInvoiceModal
          open={!!statusModalOrder}
          onClose={() => {
            setStatusModalOrder(null)
            setOrders(orderWrapper.orders)
          }}
          order={statusModalOrder}
          companyId={orderWrapper.companyId}
          orderItems={statusModalOrder.orderItems || []}
          onSuccess={newOrderId => {
            if (newOrderId) {
              reloadOrders()
            } else {
              setOrders(prev =>
                prev.map(o => (o.id === statusModalOrder.id ? { ...o, status: OrderStatus.Invoiced } : o))
              )
            }
          }}
        />
      )}

    </div>
  )
}
