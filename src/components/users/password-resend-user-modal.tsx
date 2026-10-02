import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@/interfaces/user.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useState } from 'react'
import { Loading } from '../loading'
import { Button } from '../ui/button'
// import { passwordResendUserAction } from "@/actions/users/password-resend-user.action";

interface PasswordResendUserModalProps {
  open: boolean
  onClose: () => void
  user: User
}

export function PasswordResendUserModal({ open, onClose, user }: PasswordResendUserModalProps) {
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handlePasswordResendUser = async () => {
    try {
      setIsSubmitting(true)

      // const response = await passwordResendUserAction(user.id);

      const response = {}

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Senha reenviada ao usuário com sucesso',
        status: 'success'
      })
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao reenviar senha ao usuário'

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
          <DialogTitle>Reenviar senha ao usuário</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja reenviar a senha ao usuário <strong>{user.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center justify-end gap-3'>
          <Button type='button' variant='secondary' onClick={onClose}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handlePasswordResendUser} disabled={isSubmitting}>
            Reenviar
            {isSubmitting && <Loading />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
