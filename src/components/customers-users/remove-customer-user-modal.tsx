import { removeCustomerUserAction } from '@/actions/customer-user/remove-customer-user.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { CustomerUser } from '@/interfaces/customer-user.interface'
import { Customer } from '@/interfaces/customer.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useState } from 'react'
import { Loading } from '../loading'
import { Button } from '../ui/button'

interface ModalProps {
  open: boolean
  onClose: () => void
  customer: Customer
  customerUser: CustomerUser
}

export function RemoveCustomerUserModal({ open, onClose, customer, customerUser }: ModalProps) {
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleRemoveUser = async () => {
    try {
      setIsSubmitting(true)

      const response = await removeCustomerUserAction(customer.companyId, customer.id, customerUser.id)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Usuário removido com sucesso',
        status: 'success'
      })
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao remover usuário'

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover usuário</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja remover o usuário <strong>{customerUser?.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center justify-end gap-3'>
          <Button type='button' variant='secondary' onClick={onClose}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleRemoveUser} disabled={isSubmitting}>
            Remover
            {isSubmitting && <Loading />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
