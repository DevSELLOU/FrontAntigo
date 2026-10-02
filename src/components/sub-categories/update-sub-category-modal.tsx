import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

import { updateSubCategoryAction } from '@/actions/sub-category/update-sub-category.action'
import { SubCategory } from '@/interfaces/sub-category-interface'
import { SubCategorySchema } from '@/schemas/sub-category.schema'
import { SubCategoryDto } from '@/types/dto/sub-category-dto'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

interface ModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  subCategory: SubCategory
}

export function UpdateSubCategoryModal({ open, onClose, companyId, subCategory }: ModalProps): JSX.Element {
  const { toast } = useToast()

  const form = useForm<SubCategoryDto>({
    resolver: zodResolver(SubCategorySchema),
    defaultValues: {
      ...subCategory
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const hasChanged = Object.keys(data).some(
        key => data[key as keyof SubCategoryDto] !== subCategory[key as keyof SubCategory]
      )

      if (hasChanged) {
        const response = await updateSubCategoryAction(companyId, subCategory.categoryId, subCategory.id, data)

        if (isApiErrorResponse(response)) {
          throw new CustomError(response.message)
        }

        toast({
          title: 'Subcategoria atualizada com sucesso',
          status: 'success'
        })
      }

      form.reset()
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao atualizar Subcategoria'

      toast({
        title: message,
        status: 'error'
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Subcategoria</DialogTitle>
          <DialogDescription>Preencha o campo abaixo para atualizar a Subcategoria.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className='flex flex-col gap-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex. Detergentes' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex items-center justify-end gap-3'>
              <Button type='button' variant='secondary' onClick={onClose}>
                Cancelar
              </Button>
              <Button type='submit' disabled={form.formState.isSubmitting}>
                Atualizar
                {form.formState.isSubmitting && <Loading />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
