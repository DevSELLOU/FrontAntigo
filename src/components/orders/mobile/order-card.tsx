'use client'

import { Copy, DollarSign, FileDown, Package, RefreshCw, Scissors, Trash2 } from 'lucide-react'

import { exportOrderAction } from '@/actions/order/export-order.action'
import { RowActionButton } from '@/components/shared/row-action-button'
import { Card } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { OrderStatus } from '@/enums/order-status.enum'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { Order } from '@/interfaces/order.interface'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { formatItemId } from '@/utils/format/format-item-id.util'
import { splitCurrencyParts } from '@/utils/format/split-currency-parts.util'
import { getOrderItemsSummary } from '@/utils/get-order-items-summary'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { type CSSProperties, type MouseEvent as ReactMouseEvent, useMemo, useRef, useState } from 'react'
import { OrderStageProgress } from '../common/order-stage-progress'

const RemoveOrderModal = dynamic(() => import('../common/remove-order-modal').then(m => m.RemoveOrderModal), {
  ssr: false
})
const OrderStatusModal = dynamic(() => import('../common/update-order-status-modal').then(m => m.OrderStatusModal), {
  ssr: false
})
const UpdateOrderValueModal = dynamic(() => import('../common/update-order-value').then(m => m.UpdateOrderValueModal), {
  ssr: false
})
const SplitOrderModal = dynamic(() => import('../common/split-order-modal').then(m => m.SplitOrderModal), {
  ssr: false
})

/** dnd-kit bindings, supplied by the kanban wrapper. Absent in the plain grid. */
export interface OrderCardDragBindings {
  setNodeRef?: (element: HTMLElement | null) => void
  style?: CSSProperties
  /** Opaque pass-through bindings from dnd-kit; not inspected here. */
  attributes?: Record<string, any>
  listeners?: Record<string, any>
  isDragging?: boolean
  /** Ghost card rendered inside dnd-kit's DragOverlay. */
  isOverlay?: boolean
}

interface OrderCardProps {
  order: Order
  orderWrapper: OrderWrapper
  drag?: OrderCardDragBindings
  /** Lets a parent holding its own copy of the orders refresh after a mutation. */
  onMutationSuccess?: () => void
}

export function OrderCard({ order, orderWrapper, drag, onMutationSuccess }: OrderCardProps) {
  const { toast } = useToast()
  const router = useRouter()

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false)

  const [isExporting, setIsExporting] = useState(false)

  // Press origin, so a drag (or a text selection) never counts as a click.
  const pressOriginRef = useRef<{ x: number; y: number } | null>(null)

  const editHref = `/company/${orderWrapper.companyId}/orders/edit/${order.id}`

  const handleCardActivate = () => {
    if (window.getSelection()?.toString()) return
    router.push(editHref)
  }

  const handleMutationSuccess = () => {
    if (onMutationSuccess) {
      onMutationSuccess()
      return
    }
    router.refresh()
  }

  const handleMouseDown = (event: ReactMouseEvent) => {
    const target = event.target as HTMLElement
    if (target.closest('button')) {
      pressOriginRef.current = null
      return
    }
    pressOriginRef.current = { x: event.clientX, y: event.clientY }
  }

  const handleMouseUp = (event: ReactMouseEvent) => {
    const origin = pressOriginRef.current
    pressOriginRef.current = null

    if (!origin || drag?.isDragging) return

    // Anything beyond a few pixels was a drag or a text selection, not a click.
    if (Math.abs(event.clientX - origin.x) > 4 || Math.abs(event.clientY - origin.y) > 4) return

    handleCardActivate()
  }

  const valueParts = useMemo(() => splitCurrencyParts(order?.totalValue ?? 0), [order?.totalValue])

  const customer = useMemo(
    () => orderWrapper.customers.find(c => c.id === order.customerId),
    [orderWrapper.customers, order.customerId]
  )

  const paymentCondition = useMemo(
    () => customer?.paymentConditions.find(p => p.id === order.paymentConditionId),
    [customer?.paymentConditions, order.paymentConditionId]
  )

  const responsible = useMemo(
    () => orderWrapper.users.find(c => c.id === order.responsibleUserId),
    [orderWrapper.users, order.responsibleUserId]
  )

  const responsibleUsers = useMemo(() => {
    if (order.responsibleUsers && order.responsibleUsers.length > 0) {
      return order.responsibleUsers
    }

    if (responsible) {
      return [
        {
          id: (responsible as any)?.user?.id ?? responsible.id,
          name: (responsible as any)?.user?.name ?? responsible.name
        }
      ]
    }

    return []
  }, [order.responsibleUsers, responsible])

  const { displayedProducts, remainingCount } = useMemo(
    () => getOrderItemsSummary(order.orderItems, orderWrapper.products, 1),
    [order.orderItems, orderWrapper.products]
  )

  const isPaymentDisabled = useMemo(
    () => order.status === OrderStatus.OnBudget || order.status === OrderStatus.InApproval,
    [order.status]
  )

  // Repeat business is usually a copy of an already delivered/invoiced order,
  // so duplication is allowed from any status. The copy is created fresh and
  // never inherits the source status.
  const canDuplicate = true

  // Splitting stays restricted to orders that haven't been committed downstream.
  const canSplit = order.status === OrderStatus.OnBudget || order.status === OrderStatus.InApproval

  const updatedAtDate = useMemo(() => new Date(order.updatedAt).toLocaleDateString('pt-BR'), [order.updatedAt])

  async function handleExportOrder() {
    try {
      setIsExporting(true)

      const response = await exportOrderAction(orderWrapper?.companyId, order?.id)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      if (response.data) {
        const { data: pdfUrl = '' } = response

        if (pdfUrl) {
          window.open(pdfUrl, '_blank')
        }
      } else {
        throw new CustomError('Erro desconhecido ao exportar PDF')
      }
    } catch (error: any) {
      const title = error?.message ?? 'Erro desconhecido ao exportar PDF'

      return toast({
        title,
        status: 'error'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Card
        ref={drag?.setNodeRef}
        style={drag?.style}
        role='button'
        tabIndex={0}
        {...(drag?.attributes ?? {})}
        {...(drag?.listeners ?? {})}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleCardActivate()
          }
        }}
        className={cn(
          'w-full p-3.5 flex flex-col gap-2.5 transition-colors hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
          drag ? 'cursor-grab' : 'cursor-pointer',
          drag?.isOverlay && 'cursor-grabbing shadow-pop ring-2 ring-primary',
          drag?.isDragging && 'opacity-50'
        )}
      >
        {/* ID + value */}
        <div className='flex items-center justify-between gap-2'>
          <h2 className='text-h3 text-text font-bold'>#{formatItemId(order.id)}</h2>
          <span className='text-h2 text-text tabular-nums shrink-0'>
            {valueParts.pre && <span className='text-caption font-semibold text-text-muted mr-0.5'>{valueParts.pre}</span>}
            {valueParts.main}
            <span className='text-[12px] font-semibold'>{valueParts.frac}</span>
          </span>
        </div>

        {/* Client */}
        <div>
          <div className='text-body font-bold text-text truncate'>{customer?.fantasyName ?? '-'}</div>
          {customer?.city && (
            <div className='text-caption text-text-muted'>
              {customer.city}/{customer.UF}
            </div>
          )}
        </div>

        {/* Products summary */}
        <div className='flex items-center gap-1.5 text-caption text-text-muted'>
          <Package className='h-3.5 w-3.5 shrink-0' />
          <span className='truncate'>
            {displayedProducts || '-'}
            {remainingCount > 0 ? ` +${remainingCount}` : ''}
          </span>
        </div>

        {/* Responsible / payment condition */}
        <div className='grid grid-cols-2 gap-2 text-caption'>
          <span className='text-text-body truncate'>
            {responsibleUsers.length === 0 ? '-' : responsibleUsers.map(user => user.name).join(', ')}
          </span>
          <span className='text-text-body text-right truncate'>{paymentCondition?.name ?? '-'}</span>
        </div>

        {/* Order stage progress */}
        <OrderStageProgress status={order.status} />

        {/* Actions */}
        <TooltipProvider delayDuration={200}>
          <div
            className='flex items-center justify-between border-t border-border pt-2.5'
            onClick={event => event.stopPropagation()}
          >
            <div className='flex items-center gap-0.5'>
              <RowActionButton
                label='Alterar valor pago'
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={isPaymentDisabled}
              >
                <DollarSign className='h-4 w-4' />
              </RowActionButton>
              <RowActionButton label='Alterar status' onClick={() => setIsStatusModalOpen(true)}>
                <RefreshCw className='h-4 w-4' />
              </RowActionButton>
              {canDuplicate && (
                <RowActionButton
                  label='Duplicar'
                  onClick={() => router.push(`/company/${orderWrapper.companyId}/orders/duplicate/${order.id}`)}
                >
                  <Copy className='h-4 w-4' />
                </RowActionButton>
              )}
              {canSplit && (
                <RowActionButton label='Dividir pedido' onClick={() => setIsSplitModalOpen(true)}>
                  <Scissors className='h-4 w-4' />
                </RowActionButton>
              )}
              <RowActionButton
                label='Remover'
                onClick={() => setIsRemoveModalOpen(true)}
                className='hover:text-danger-foreground'
              >
                <Trash2 className='h-4 w-4' />
              </RowActionButton>
              <RowActionButton label='Exportar PDF' onClick={handleExportOrder}>
                <FileDown className={isExporting ? 'h-4 w-4 animate-pulse' : 'h-4 w-4'} />
              </RowActionButton>
            </div>
            <span className='text-caption text-text-muted whitespace-nowrap tabular-nums'>{updatedAtDate}</span>
          </div>
        </TooltipProvider>
      </Card>

      {isPaymentModalOpen ? (
        <UpdateOrderValueModal
          order={order}
          orderWrapper={orderWrapper}
          open={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handleMutationSuccess}
        />
      ) : null}

      {isRemoveModalOpen ? (
        <RemoveOrderModal open={isRemoveModalOpen} onClose={() => setIsRemoveModalOpen(false)} order={order} />
      ) : null}

      {isStatusModalOpen ? (
        <OrderStatusModal open={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} order={order} />
      ) : null}

      {isSplitModalOpen ? (
        <SplitOrderModal
          open={isSplitModalOpen}
          onClose={() => setIsSplitModalOpen(false)}
          order={order}
          companyId={orderWrapper.companyId}
          orderItems={order.orderItems || []}
          onSuccess={() => {
            setIsSplitModalOpen(false)
            handleMutationSuccess()
          }}
        />
      ) : null}
    </>
  )
}
