'use client'

import { splitOrderAction } from '@/actions/order/split-order.action'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { Order, OrderItem } from '@/interfaces/order.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { Package, Scissors } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Loading } from '../../loading'
import { Button } from '../../ui/button'
import { Checkbox } from '../../ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'

interface ProductSplitItem {
  productId: number
  productName: string
  totalQuantity: number
  quantityToKeep: number
  selected: boolean
}

interface SplitOrderModalProps {
  open: boolean
  onClose: () => void
  order: Order
  companyId: number
  orderItems: OrderItem[]
  onSuccess: (newOrderId: number) => void
}

export function SplitOrderModal({ open, onClose, order, companyId, orderItems, onSuccess }: SplitOrderModalProps) {
  const { toast } = useToast()
  const [isSplitting, setIsSplitting] = useState(false)
  const [productItems, setProductItems] = useState<ProductSplitItem[]>([])

  useEffect(() => {
    if (open && orderItems && orderItems.length > 0) {
      const items = orderItems.map(item => ({
        productId: item.productId,
        productName: item.product?.name || `Produto ${item.productId}`,
        totalQuantity: item.quantity,
        quantityToKeep: item.quantity,
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
        item.productId === productId 
          ? { 
              ...item, 
              selected: !item.selected,
              quantityToKeep: !item.selected ? item.totalQuantity : 0
            } 
          : item
      )
    )
  }

  const updateProductQuantity = (productId: number, quantity: number) => {
    setProductItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantityToKeep: Math.min(Math.max(0, quantity), item.totalQuantity) }
          : item
      )
    )
  }

  const toggleSelectAll = (selectAll: boolean) => {
    setProductItems(prev => prev.map(item => ({ 
      ...item, 
      selected: selectAll,
      quantityToKeep: selectAll ? item.totalQuantity : 0 
    })))
  }

  const handleConfirm = async () => {
    const selectedItems = productItems.filter(item => item.selected && item.quantityToKeep > 0)

    if (selectedItems.length === 0) {
      toast({
        title: 'Selecione pelo menos um produto para manter',
        status: 'error'
      })
      return
    }

    if (selectedItems.length === productItems.length) {
      toast({
        title: 'Selecione pelo menos um produto para mover para o novo pedido',
        status: 'error'
      })
      return
    }

    setIsSplitting(true)

    try {
      const response = await splitOrderAction(
        companyId,
        order.id,
        selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantityToKeep
        }))
      )

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      const newOrderId = response.data.newOrder.id

      toast({
        title: `Pedido dividido com sucesso. Novo pedido #${newOrderId} criado.`,
        status: 'success'
      })

      onSuccess(newOrderId)
      onClose()
    } catch (error: any) {
      console.error('handleConfirm - error:', error)
      const title = error?.message ?? 'Erro desconhecido ao dividir pedido'

      toast({
        title,
        status: 'error'
      })
    } finally {
      setIsSplitting(false)
    }
  }

  const selectedCount = productItems.filter(item => item.selected && item.quantityToKeep > 0).length
  const totalCount = productItems.length
  const movedCount = totalCount - selectedCount

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='h-auto max-w-md items-start rounded-3xl border-border'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-h2 text-text'>
            <Scissors className='h-5 w-5 text-[#008440]' />
            Dividir pedido #{order.id}
          </DialogTitle>
          <DialogDescription className='text-body text-text-muted'>
            Selecione os produtos e quantidades que devem permanecer neste pedido. Os demais serão movidos para um novo pedido.
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
                    <Label className='text-xs text-text-muted'>Manter:</Label>
                    <Input
                      type='number'
                      min={0}
                      max={item.totalQuantity}
                      value={item.quantityToKeep}
                      onChange={e => updateProductQuantity(item.productId, parseInt(e.target.value) || 0)}
                      disabled={!item.selected}
                      className='w-16 h-8'
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className='border-t border-border pt-2 text-label text-text-body'>
              {selectedCount} produtos para manter, {movedCount} para novo pedido
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant='secondary' className='rounded-xl' onClick={onClose} disabled={isSplitting}>
            Cancelar
          </Button>
          <Button
            className='rounded-xl'
            onClick={handleConfirm}
            disabled={isSplitting || selectedCount === 0 || selectedCount === totalCount}
          >
            <Scissors className='h-4 w-4 mr-2' />
            Dividir pedido
            {isSplitting && <Loading />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
