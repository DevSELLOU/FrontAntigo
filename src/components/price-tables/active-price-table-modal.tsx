import { updatePriceTableStatusAction } from '@/actions/price-table/update-price-table-status.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GenericStatus } from '@/enums/generic-status.enum'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { PriceTable } from '@/interfaces/price-table.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useState } from 'react'
import { Loading } from '../loading'
import { Button } from '../ui/button'

interface ModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  priceTable: PriceTable
}

export function ActivePriceTableModal({ open, onClose, companyId, priceTable }: ModalProps) {
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleActive = async () => {
    try {
      setIsSubmitting(true)

      const response = await updatePriceTableStatusAction(
        companyId,
        priceTable.id,
        GenericStatus.Active
      )

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Tabela ativada com sucesso',
        status: 'success'
      })
      onClose()
    } catch (error: any) {
      const message = error?.message || 'Erro desconhecido ao ativar a tabela'

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
          <DialogTitle>Ativar tabela</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja ativar a tabela <strong>{priceTable.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center justify-end gap-3'>
          <Button type='button' variant='secondary' onClick={onClose}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleActive} disabled={isSubmitting}>
            Ativar
            {isSubmitting && <Loading />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
