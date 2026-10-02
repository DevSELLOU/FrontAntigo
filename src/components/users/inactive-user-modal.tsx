import { updateUserStatusAction } from '@/actions/user/update-user-status.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserStatus } from '@/enums/user-status.enum'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@/interfaces/user.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useState } from 'react'
import { Loading } from '../loading'
import { Button } from '../ui/button'
// import { updateUserStatusAction } from "@/actions/users/update-user-status.action";

interface InactiveUserModalProps {
  open: boolean
  onClose: () => void
  user: User
}

export function InactiveUserModal({ open, onClose, user }: InactiveUserModalProps) {
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleInactiveUser = async () => {
    try {
      setIsSubmitting(true)

      const response = await updateUserStatusAction(user.id, UserStatus.Inactive)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Usuário inativado com sucesso',
        status: 'success'
      })
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao inativar usuário'

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
          <DialogTitle>Inativar usuário</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja inativar o usuário <strong>{user.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center justify-end gap-3'>
          <Button type='button' variant='secondary' onClick={onClose}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleInactiveUser} disabled={isSubmitting}>
            Inativar
            {isSubmitting && <Loading />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
