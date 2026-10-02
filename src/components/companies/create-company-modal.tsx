'use client'

import { createCompanyAction } from '@/actions/company/create-company.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { CompanySchema } from '@/schemas/company.schema'
import { formatCnpj } from '@/utils/format/format-cnpj.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loading } from '../loading'
import { Button } from '../ui/button'

interface ModalProps {
  open: boolean
  onClose: () => void
}

export function CreateCompanyModal({ open, onClose }: ModalProps) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof CompanySchema>>({
    resolver: zodResolver(CompanySchema),
    defaultValues: {
      corporateName: '',
      fantasyName: '',
      cnpj: ''
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const response = await createCompanyAction(data)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Empresa criada com sucesso',
        status: 'success'
      })

      form.reset()
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao criar a empresa'

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
          <DialogTitle>Criar empresa</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para criar uma nova empresa.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className='flex flex-col gap-4'>
            <FormField
              control={form.control}
              name='corporateName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex. Empresa LTDA' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='fantasyName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex. Empresa' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='cnpj'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex. 00.000.000/0000-00'
                      {...field}
                      value={formatCnpj(field.value)}
                      onChange={e => field.onChange(formatCnpj(e.target.value))}
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
