'use client'

import { updateOrderStatusAction } from '@/actions/order/update-order-status.action'
import { OrderStatus } from '@/enums/order-status.enum'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { Order } from '@/interfaces/order.interface'
import { UpdateOrderStatusDto } from '@/types/dto/update-order-status-dto'
import { getOrderStatusBadgeStyle } from '@/utils/get-order-status-badge-style.util'
import { getOrderStatusText } from '@/utils/get-order-status-text.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { ArrowRight, Package } from 'lucide-react'
import { useState } from 'react'
import { Loading } from '../../loading'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Checkbox } from '../../ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group'
import { Textarea } from '../../ui/textarea'

interface ProductInvoiceItem {
  productId: number
  productName: string
  totalQuantity: number
  quantityToInvoice: number
  selected: boolean
}

interface ModalProps {
  open: boolean
  onClose: () => void
  order: Order
}

const allowedTransitions: Record<Exclude<OrderStatus, OrderStatus.Blocked>, OrderStatus[]> = {
  [OrderStatus.OnBudget]: [OrderStatus.InApproval],
  [OrderStatus.InApproval]: [OrderStatus.Approved],
  [OrderStatus.Approved]: [OrderStatus.Invoiced],
  [OrderStatus.Invoiced]: [OrderStatus.Dispatched],
  [OrderStatus.Dispatched]: [OrderStatus.Delivered],
  [OrderStatus.Delivered]: [OrderStatus.Returned],
  [OrderStatus.Returned]: [],
  [OrderStatus.Canceled]: []
}

export function OrderStatusModal({ open, onClose, order }: ModalProps) {
  const { toast } = useToast()
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [returnReason, setReturnReason] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [productItems, setProductItems] = useState<ProductInvoiceItem[]>([])

  const { status: currentStatus } = order
  const isPartialInvoicing = selectedStatus === OrderStatus.Invoiced && currentStatus === OrderStatus.Approved

  const initializeProductItems = () => {
    if (order.orderItems) {
      const items = order.orderItems.map(item => ({
        productId: item.productId,
        productName: item.product?.name || `Produto ${item.productId}`,
        totalQuantity: item.quantity,
        quantityToInvoice: item.quantity,
        selected: true
      }))
      setProductItems(items)
    }
  }

  const handleStatusChange = async () => {
    try {
      setIsUpdating(true)

      const isChanged = selectedStatus !== currentStatus

      if (isChanged) {
        if (isPartialInvoicing && productItems.length > 0) {
          const selectedItems = productItems.filter(item => item.selected && item.quantityToInvoice > 0)
          
          if (selectedItems.length === 0) {
            throw new CustomError('Selecione pelo menos um produto para faturar')
          }

          const data = {
            status: selectedStatus!,
            returnReason: '',
            partialInvoicing: selectedItems.map(item => ({
              productId: item.productId,
              quantity: item.quantityToInvoice
            }))
          } satisfies UpdateOrderStatusDto & { partialInvoicing: { productId: number; quantity: number }[] }

          const response = await updateOrderStatusAction(order.companyId, order.id, data)

          if (isApiErrorResponse(response)) {
            throw new CustomError(response.message)
          }

          toast({
            title: 'Pedido parcialmente faturado com sucesso',
            status: 'success'
          })
        } else {
          const data = {
            status: selectedStatus!,
            returnReason: selectedStatus === OrderStatus.Returned ? returnReason : ''
          } satisfies UpdateOrderStatusDto

          const response = await updateOrderStatusAction(order.companyId, order.id, data)

          if (isApiErrorResponse(response)) {
            throw new CustomError(response.message)
          }

          toast({
            title: 'Status do pedido atualizado com sucesso',
            status: 'success'
          })
        }

        onCloseModal()
      }
    } catch (error: any) {
      const title = error?.message ?? 'Erro desconhecido ao atualizar status do pedido'

      return toast({
        title,
        status: 'error'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const resetState = () => {
    setSelectedStatus(null)
    setReturnReason('')
    setIsUpdating(false)
    setProductItems([])
  }

  const onCloseModal = () => {
    resetState()
    onClose()
  }

  const handleStatusSelection = (status: OrderStatus) => {
    setSelectedStatus(status)
    if (status === OrderStatus.Invoiced && currentStatus === OrderStatus.Approved) {
      initializeProductItems()
    }
  }

  const toggleProductSelection = (productId: number) => {
    setProductItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, selected: !item.selected } : item
      )
    )
  }

  const updateProductQuantity = (productId: number, quantity: number) => {
    setProductItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantityToInvoice: Math.min(Math.max(1, quantity), item.totalQuantity) }
          : item
      )
    )
  }

  const toggleSelectAll = (selectAll: boolean) => {
    setProductItems(prev => prev.map(item => ({ ...item, selected: selectAll })))
  }

  const selectedCount = productItems.filter(item => item.selected && item.quantityToInvoice > 0).length
  const totalCount = productItems.length

  const isStatusValid = (status: OrderStatus): boolean => {
    if (currentStatus === OrderStatus.Blocked) {
      return false
    }
    return allowedTransitions[currentStatus as Exclude<OrderStatus, OrderStatus.Blocked>]?.includes(status) ?? false
  }

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className='max-h-[92vh] items-start overflow-hidden rounded-3xl border-border p-0 sm:max-w-lg'>
        <DialogHeader className='border-b border-border bg-surface-muted/70 px-5 py-5 text-left sm:px-6'>
          <DialogTitle className='text-xl font-bold text-text'>Alterar status do pedido</DialogTitle>
          <DialogDescription className='flex flex-wrap items-center gap-2 text-caption text-text-muted'>
            <span>Pedido #{order.id}</span>
            <span aria-hidden='true'>•</span>
            <span>Status atual</span>
            <Badge
              variant='secondary'
              className='rounded-full font-semibold shadow-none'
              style={getOrderStatusBadgeStyle(currentStatus)}
            >
              {getOrderStatusText(currentStatus)}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className='grid max-h-[calc(92vh-190px)] w-full gap-4 overflow-y-auto px-5 py-5 sm:px-6'>
          <RadioGroup
            value={selectedStatus || currentStatus}
            onValueChange={value => {
              handleStatusSelection(value as OrderStatus)
              if (value !== OrderStatus.Returned) {
                setReturnReason('')
              }
            }}
          >
            {Object.values(OrderStatus)
              .filter(status => status !== OrderStatus.Blocked)
              .map(status => {
                const isValid = isStatusValid(status)
                const isCurrent = status === currentStatus

                return (
                  <div key={status} className='flex items-center space-x-2 space-y-0'>
                    <div className='flex items-center space-x-2 flex-1'>
                      <RadioGroupItem value={status} id={status} disabled={!isValid || isCurrent} />
                      <Label
                        htmlFor={status}
                        className={`font-normal flex items-center space-x-2 ${
                          !isValid || isCurrent ? 'text-text-muted' : 'text-text-body'
                        }`}
                      >
                        <span>{getOrderStatusText(status)}</span>
                      </Label>
                    </div>
                  </div>
                )
              })}
          </RadioGroup>

          {isPartialInvoicing && productItems.length > 0 && (
            <div className='mt-4 space-y-3 rounded-2xl border border-border bg-surface-muted p-4'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <Package className='h-5 w-5 text-[#008440]' />
                  <span className='text-label text-text'>Produtos para faturar</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => toggleSelectAll(true)}
                    className='h-7 rounded-lg text-xs'
                  >
                    Selecionar todos
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => toggleSelectAll(false)}
                    className='h-7 rounded-lg text-xs'
                  >
                    Desmarcar todos
                  </Button>
                </div>
              </div>

              <div className='mb-2 text-caption text-text-muted'>
                Selecione os produtos e informe a quantidade a ser faturada
              </div>

              <div className='space-y-2 max-h-[250px] overflow-y-auto'>
                {productItems.map(item => (
                  <div
                    key={item.productId}
                    className={`flex items-center gap-3 rounded-xl border border-border p-2 ${
                      item.selected ? 'bg-surface' : 'opacity-60'
                    }`}
                  >
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={() => toggleProductSelection(item.productId)}
                    />
                    <div className='flex-1 min-w-0'>
                      <div className='truncate text-sm font-medium text-text'>{item.productName}</div>
                      <div className='text-xs text-text-muted'>
                        Total no pedido: {item.totalQuantity}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Label className='text-xs text-text-muted'>Qtd:</Label>
                      <Input
                        type='number'
                        min={0}
                        max={item.totalQuantity}
                        value={item.quantityToInvoice}
                        onChange={e => updateProductQuantity(item.productId, parseInt(e.target.value) || 0)}
                        disabled={!item.selected}
                        className='w-16 h-8'
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className='border-t border-border pt-2 text-label text-text-body'>
                {selectedCount} de {totalCount} produtos selecionados para faturar
              </div>
            </div>
          )}

          {(selectedStatus === OrderStatus.Returned || currentStatus === OrderStatus.Returned) && (
            <div className='space-y-2'>
              <Label htmlFor='return-reason' className='text-label text-text-body'>
                Motivo da devolução
              </Label>
              <Textarea
                id='return-reason'
                placeholder='Descreva o motivo da devolução...'
                value={returnReason || order.returnReason}
                readOnly={currentStatus === OrderStatus.Returned}
                onChange={e => setReturnReason(e.target.value)}
                className='min-h-[100px]'
              />
            </div>
          )}

          {(order as any).statusHistory?.length > 0 && (
            <div className='w-full space-y-2 border-t border-border pt-4'>
              <span className='text-label text-text'>Histórico de status</span>
              <div className='max-h-[200px] space-y-2 overflow-y-auto'>
                {(order as any).statusHistory.map((history: any, index: number) => (
                  <div key={index} className='flex flex-wrap items-center gap-2 text-sm'>
                    <span className='text-xs tabular-nums text-text-muted'>
                      {new Date(history.createdAt).toLocaleString('pt-BR')}
                    </span>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className='rounded-full border-transparent opacity-60'
                        style={getOrderStatusBadgeStyle(history.oldStatus)}
                      >
                        {getOrderStatusText(history.oldStatus)}
                      </Badge>
                      <ArrowRight className='h-3 w-3 text-text-muted' />
                      <Badge
                        variant='outline'
                        className='rounded-full border-transparent'
                        style={getOrderStatusBadgeStyle(history.newStatus)}
                      >
                        {getOrderStatusText(history.newStatus)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='border-t border-border bg-surface-muted/70 px-5 py-4 sm:px-6'>
          <Button variant='secondary' className='rounded-xl' onClick={onClose} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button className='rounded-xl' onClick={handleStatusChange} disabled={!selectedStatus || isUpdating}>
            Confirmar
            {isUpdating && <Loading />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
