import { removeProductAction } from '@/actions/product/remove-product.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { Product } from '@/interfaces/product.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useState } from 'react'
import { Loading } from '../../loading'
import { Button } from '../../ui/button'

interface ModalProps {
  open: boolean
  onClose: () => void
  product: Product
}

export function RemoveProductModal({ open, onClose, product }: ModalProps) {
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleRemove = async () => {
    try {
      setIsSubmitting(true)

      const response = await removeProductAction(product.companyId, product.id)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Produto removido com sucesso',
        status: 'success'
      })
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao remover produto'

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
          <DialogTitle>Remover produto</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja remover o produto <strong>{product.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center justify-end gap-3'>
          <Button type='button' variant='secondary' onClick={onClose}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleRemove} disabled={isSubmitting}>
            Remover
            {isSubmitting && <Loading />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
