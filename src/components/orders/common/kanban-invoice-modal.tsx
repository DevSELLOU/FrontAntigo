'use client'

import { updateOrderStatusAction } from '@/actions/order/update-order-status.action'
import { OrderStatus } from '@/enums/order-status.enum'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { Order, OrderItem } from '@/interfaces/order.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { Package, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Loading } from '../../loading'
import { Button } from '../../ui/button'
import { Checkbox } from '../../ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'

interface ProductInvoiceItem {
  productId: number
  productName: string
  totalQuantity: number
  quantityToInvoice: number
  selected: boolean
}

interface KanbanInvoiceModalProps {
  open: boolean
  onClose: () => void
  order: Order
  companyId: number
  orderItems: OrderItem[]
  onSuccess: (newOrderId?: number) => void
}

export function KanbanInvoiceModal({ open, onClose, order, companyId, orderItems, onSuccess }: KanbanInvoiceModalProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [productItems, setProductItems] = useState<ProductInvoiceItem[]>([])

  useEffect(() => {
    if (open && orderItems && orderItems.length > 0) {
      const items = orderItems.map(item => ({
        productId: item.productId,
        productName: item.product?.name || `Produto ${item.productId}`,
        totalQuantity: item.quantity,
        quantityToInvoice: item.quantity,
        selected: true
      }))
      setProductItems(items)
    }
  }, [open, orderItems])

  useEffect(() => {
    if (!open) {
      setProductItems([])
    }
  }, [open])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setProductItems([])
      onClose()
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

  const handleConfirm = async () => {
    const selectedItems = productItems.filter(item => item.selected && item.quantityToInvoice > 0)

    if (selectedItems.length === 0) {
      toast({
        title: 'Selecione pelo menos um produto para faturar',
        status: 'error'
      })
      return
    }

    setIsUpdating(true)

    try {
      const response = await updateOrderStatusAction(
        companyId,
        order.id,
        {
          status: OrderStatus.Invoiced,
          returnReason: '',
          partialInvoicing: selectedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantityToInvoice
          }))
        }
      )

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      const newOrderId = (response as any)?.data?.newOrder?.id

      toast({
        title: newOrderId 
          ? 'Pedido faturado parcialmente. Novo pedido criado com os produtos restantes.'
          : 'Pedido faturado com sucesso',
        status: 'success'
      })

      onSuccess(newOrderId)
      onClose()
    } catch (error: any) {
      const title = error?.message ?? 'Erro desconhecido ao faturar pedido'

      toast({
        title,
        status: 'error'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const selectedCount = productItems.filter(item => item.selected && item.quantityToInvoice > 0).length
  const totalCount = productItems.length

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='h-auto max-w-md items-start rounded-3xl border-border'>
        <DialogHeader>
          <DialogTitle className='text-h2 text-text'>Faturar pedido #{order.id}</DialogTitle>
          <DialogDescription className='text-body text-text-muted'>
            Selecione os produtos e quantidades para faturar este pedido
          </DialogDescription>
        </DialogHeader>

        {productItems.length === 0 ? (
          <div className='w-full py-8 text-center text-body text-text-muted'>
            Nenhum produto encontrado neste pedido
          </div>
        ) : (
          <div className='w-full max-h-[400px] space-y-3 overflow-y-auto rounded-2xl border border-border bg-surface-muted p-4'>
            <div className='sticky top-0 flex flex-wrap items-center justify-between gap-2 bg-surface-muted pb-2'>
              <div className='flex items-center gap-2'>
                <Package className='h-5 w-5 text-[#008440]' />
                <span className='text-label text-text'>Produtos</span>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => toggleSelectAll(true)}
                  className='h-7 rounded-lg text-xs'
                >
                  Todos
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => toggleSelectAll(false)}
                  className='h-7 rounded-lg text-xs'
                >
                  Nenhum
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
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
                      Total: {item.totalQuantity}
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
              {selectedCount} de {totalCount} produtos selecionados
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant='secondary' className='rounded-xl' onClick={onClose} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button className='rounded-xl' onClick={handleConfirm} disabled={isUpdating || selectedCount === 0}>
            <Check className='h-4 w-4 mr-2' />
            Confirmar faturamento
            {isUpdating && <Loading />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
