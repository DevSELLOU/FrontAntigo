import { removeSubCategoryAction } from '@/actions/sub-category/remove-sub-category.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { SubCategory } from '@/interfaces/sub-category-interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useState } from 'react'
import { Loading } from '../loading'
import { Button } from '../ui/button'

interface ModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  subCategory: SubCategory
}

export function RemoveSubCategoryModal({ open, onClose, companyId, subCategory }: ModalProps) {
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleRemove = async () => {
    try {
      setIsSubmitting(true)

      const response = await removeSubCategoryAction(companyId, subCategory.categoryId, subCategory.id)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Removido com sucesso',
        status: 'success'
      })
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao remover'

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
          <DialogTitle>Remover Subcategoria</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja remover a Subcategoria <strong>{subCategory.name}</strong>?
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
