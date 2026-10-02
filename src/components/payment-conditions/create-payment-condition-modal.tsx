import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { PaymentConditionSchema } from '@/schemas/payment-condition.schema'
import { PaymentConditionDto } from '@/types/dto/payment-condition-dto'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

import { createPaymentConditionAction } from '@/actions/payment-condition/create-payment-condition.action'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

interface ModalProps {
  open: boolean
  onClose: () => void
  companyId: number
}

export function CreatePaymentConditionModal({ open, onClose, companyId }: ModalProps): JSX.Element {
  const { toast } = useToast()

  const form = useForm<PaymentConditionDto>({
    resolver: zodResolver(PaymentConditionSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const response = await createPaymentConditionAction(companyId, data)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Criado com sucesso',
        status: 'success'
      })

      form.reset()
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao criar'

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
          <DialogTitle>Criar condição de pagamento</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para criar uma nova condição.</DialogDescription>
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
                    <Input placeholder='Ex. À vista + 30 dias' {...field} />
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
                      placeholder='Ex. Precisa dar uma entrada de no mínimo 30% e o restante em 30 dias'
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
