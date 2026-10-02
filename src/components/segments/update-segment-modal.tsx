import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

import { updateSegmentAction } from '@/actions/segment/update-segment.action'
import { Segment } from '@/interfaces/segment.interface'
import { SegmentSchema } from '@/schemas/segment.schema'
import { SegmentDto } from '@/types/dto/segment-dto'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

interface ModalProps {
  open: boolean
  onClose: () => void
  segment: Segment
}

export function UpdateSegmentModal({ open, onClose, segment }: ModalProps): JSX.Element {
  const { toast } = useToast()

  const form = useForm<SegmentDto>({
    resolver: zodResolver(SegmentSchema),
    defaultValues: {
      ...segment
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const hasChanged = Object.keys(data).some(key => data[key as keyof SegmentDto] !== segment[key as keyof Segment])

      if (hasChanged) {
        const response = await updateSegmentAction(segment.companyId, segment.id, data)

        if (isApiErrorResponse(response)) {
          throw new CustomError(response.message)
        }

        toast({
          title: 'Segmento atualizado com sucesso',
          status: 'success'
        })
      }

      form.reset()
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao atualizar segmento'

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
          <DialogTitle>Atualizar segmento</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para atualizar o segmento.</DialogDescription>
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
                    <Input placeholder='Ex. Lojas de Roupas e Acessórios' {...field} />
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
                    <Textarea
                      className='resize-none'
                      placeholder='Ex. Estabelecimentos físicos ou online que comercializam roupas, calçados e acessórios para o público em geral'
                      {...field}
                    />
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
