import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

import { createSubSegmentAction } from '@/actions/sub-segment/create-sub-segment.action'
import { SubSegmentSchema } from '@/schemas/sub-segment.schema'
import { SubSegmentDto } from '@/types/dto/sub-segment-dto'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

interface ModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  segmentId: number
}

export function CreateSubSegmentModal({ open, onClose, companyId, segmentId }: ModalProps): JSX.Element {
  const { toast } = useToast()

  const form = useForm<SubSegmentDto>({
    resolver: zodResolver(SubSegmentSchema),
    defaultValues: {
      name: ''
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const response = await createSubSegmentAction(companyId, segmentId, data)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Subsegmento criado com sucesso',
        status: 'success'
      })

      form.reset()
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao criar subsegmento'

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
          <DialogTitle>Criar Subsegmento</DialogTitle>
          <DialogDescription>Preencha o campo abaixo para criar um Subsegmento.</DialogDescription>
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
                    <Input placeholder='Ex. Lojas de Roupas Esportivas' {...field} />
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
                Criar
                {form.formState.isSubmitting && <Loading />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
