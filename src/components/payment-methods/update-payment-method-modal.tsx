import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

import { updatePaymentMethodAction } from '@/actions/payment-method/update-payment-method.action'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { PaymentMethodSchema } from '@/schemas/payment-method.schema'
import { PaymentMethodDto } from '@/types/dto/payment-method-dto'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

interface ModalProps {
  open: boolean
  onClose: () => void
  paymentMethod: PaymentMethod
}

export function UpdatePaymentMethodModal({ open, onClose, paymentMethod }: ModalProps): JSX.Element {
  const { toast } = useToast()

  const form = useForm<PaymentMethodDto>({
    resolver: zodResolver(PaymentMethodSchema),
    defaultValues: {
      ...paymentMethod
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const hasChanged = Object.keys(data).some(
        key => data[key as keyof PaymentMethodDto] !== paymentMethod[key as keyof PaymentMethod]
      )

      if (hasChanged) {
        const response = await updatePaymentMethodAction(paymentMethod.companyId, paymentMethod.id, data)

        if (isApiErrorResponse(response)) {
          throw new CustomError(response.message)
        }

        toast({
          title: 'Atualizado com sucesso',
          status: 'success'
        })
      }

      form.reset()
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao atualizar'

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
          <DialogTitle>Atualizar método de pagamento</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para atualizar o método.</DialogDescription>
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
                    <Input placeholder='Ex. Cartão de crédito' {...field} />
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
                      placeholder='Ex. Taxa de 2% para pagamentos no crédito à vista'
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
