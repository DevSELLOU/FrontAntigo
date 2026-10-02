import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

import { updateCategoryAction } from '@/actions/category/update-category.action'
import { Category } from '@/interfaces/category.interface'
import { CategorySchema } from '@/schemas/category.schema'
import { CategoryDto } from '@/types/dto/category-dto'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

interface ModalProps {
  open: boolean
  onClose: () => void
  category: Category
}

export function UpdateCategoryModal({ open, onClose, category }: ModalProps): JSX.Element {
  const { toast } = useToast()

  const form = useForm<CategoryDto>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      ...category
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const hasChanged = Object.keys(data).some(
        key => data[key as keyof CategoryDto] !== category[key as keyof Category]
      )

      if (hasChanged) {
        const response = await updateCategoryAction(category.companyId, category.id, data)

        if (isApiErrorResponse(response)) {
          throw new CustomError(response.message)
        }

        toast({
          title: 'Categoria atualizada com sucesso',
          status: 'success'
        })
      }

      form.reset()
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao atualizar categoria'

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
          <DialogTitle>Atualizar categoria</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para atualizar a categoria.</DialogDescription>
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
                    <Input placeholder='Ex. Limpeza' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea className='resize-none' placeholder='Ex. Categoria para produtos de limpeza' {...field} />
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
