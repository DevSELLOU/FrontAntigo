import { removeOrderAction } from '@/actions/order/remove-order.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { Order } from '@/interfaces/order.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useState } from 'react'
import { Loading } from '../../loading'
import { Button } from '../../ui/button'

interface ModalProps {
  open: boolean
  onClose: () => void
  order: Order
}

export function RemoveOrderModal({ open, onClose, order }: ModalProps) {
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleRemove = async () => {
    try {
      setIsSubmitting(true)

      const response = await removeOrderAction(order.companyId, order.id)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Pedido removido com sucesso',
        status: 'success'
      })
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao remover pedido'

      toast({
        title: message,
        status: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='h-auto rounded-3xl border-border sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-h2 text-text'>Remover pedido</DialogTitle>
          <DialogDescription className='text-body text-text-muted'>
            Você tem certeza que deseja remover o pedido N°{' '}
            <strong className='text-text'>{order.id.toString().padStart(4, '0')}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center justify-end gap-3'>
          <Button type='button' variant='secondary' className='rounded-xl' onClick={onClose}>
            Cancelar
          </Button>
          <Button variant='destructive' className='rounded-xl' onClick={handleRemove} disabled={isSubmitting}>
            Remover
            {isSubmitting && <Loading />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
