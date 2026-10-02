import { updateOrderValueAction } from '@/actions/order/update-order-value.action'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormField } from '@/components/ui/form'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { Order } from '@/interfaces/order.interface'
import { UpdateOrderValueSchema } from '@/schemas/update-order-value.schema'
import { UpdateOrderValueDto } from '@/types/dto/update-order-value-dto'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loading } from '../../loading'
import InputCurrency from '../../ui/input-currency'
import { Separator } from '../../ui/separator'

interface ModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  order: Order
  orderWrapper: OrderWrapper
}

export function UpdateOrderValueModal({ open, onClose, onSuccess, order, orderWrapper }: ModalProps) {
  const { toast } = useToast()

  const customer = orderWrapper?.customers?.find(customer => customer?.id === order?.customerId)

  const form = useForm<UpdateOrderValueDto>({
    resolver: zodResolver(UpdateOrderValueSchema),
    defaultValues: {
      ...order
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const response = await updateOrderValueAction(order.companyId, order.id, data)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Pedido atualizado com sucesso',
        status: 'success'
      })

      form.reset()
      onClose()
      onSuccess?.()
    } catch (error: any) {
      const title = error?.message ?? 'Erro desconhecido ao atualizar pedido'

      return toast({
        title,
        status: 'error'
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='h-auto items-start rounded-3xl border-border sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-h2 text-text'>
            Pedido n° {order?.id?.toString()?.padStart(4, '0')}
          </DialogTitle>
          <DialogDescription className='text-body text-text-muted'>
            Cliente: {customer?.fantasyName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <Separator />

          <form onSubmit={onSubmit} className='flex flex-col gap-4 w-full'>
            <FormField
              control={form.control}
              name='amountPaid'
              render={({ field }) => (
                <InputCurrency
                  label='Valor pago'
                  placeholder='Informe o valor já pago pelo cliente'
                  {...field}
                  onChange={e => field.onChange(e.target.value)}
                />
              )}
            />

            <div className='mt-4 flex justify-end gap-2'>
              <Button type='button' variant='secondary' className='rounded-xl' onClick={onClose}>
                Cancelar
              </Button>
              <Button type='submit' className='rounded-xl' disabled={form.formState.isSubmitting}>
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
