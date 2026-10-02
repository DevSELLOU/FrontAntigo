import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@/interfaces/user.interface'
import { Loading } from '../loading'
import { Button } from '../ui/button'
// import { removeUserAction } from "@/actions/users/remove-user.action";
import { removeUserAction } from '@/actions/user/remove-user.action'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useState } from 'react'

interface RemoveUserModalProps {
  open: boolean
  onClose: () => void
  user: User
}

export function RemoveUserModal({ open, onClose, user }: RemoveUserModalProps) {
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleRemoveUser = async () => {
    try {
      setIsSubmitting(true)

      const response = await removeUserAction(user.id)

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
            Você tem certeza que deseja remover o usuário <strong>{user.name}</strong>?
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
