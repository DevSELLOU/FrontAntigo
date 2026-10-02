import { removeSubSegmentAction } from '@/actions/sub-segment/remove-sub-segment.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { SubSegment } from '@/interfaces/sub-segment.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useState } from 'react'
import { Loading } from '../loading'
import { Button } from '../ui/button'

interface ModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  subSegment: SubSegment
}

export function RemoveSubSegmentModal({ open, onClose, companyId, subSegment }: ModalProps) {
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleRemove = async () => {
    try {
      setIsSubmitting(true)

      const response = await removeSubSegmentAction(companyId, subSegment.segmentId, subSegment.id)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Subsegmento removido com sucesso',
        status: 'success'
      })
      onClose()
    } catch (error: any) {
      const title = error?.message ?? 'Erro ao remover o subsegmento.'

      toast({
        title,
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
          <DialogTitle>Remover Subsegmento</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja remover o Subsegmento <strong>{subSegment.name}</strong>?
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
