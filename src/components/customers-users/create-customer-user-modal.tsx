'use client'

import { createCustomerUserAction } from '@/actions/customer-user/create-customer-user.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UserRole } from '@/enums/user-role.enum'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { UserCompanySchema } from '@/schemas/user-company.schema'
import { UserCompanyDto } from '@/types/dto/user-company-dto'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { getUserRoleText } from '@/utils/users/get-user-role-text.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useRouter } from 'next/navigation'

interface ModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  customerId: number
}

export function CreateUserCompanyModal({ open, onClose, companyId, customerId }: ModalProps): JSX.Element {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<UserCompanyDto>({
    resolver: zodResolver(UserCompanySchema),
    defaultValues: {
      name: '',
      email: ''
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const response = await createCustomerUserAction(companyId, customerId, data)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Usuário criado com sucesso',
        status: 'success'
      })

      form.reset()
      onClose()
      router.refresh()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao criar usuário'

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
          <DialogTitle>Criar usuário</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para criar um novo usuário.</DialogDescription>
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
                    <Input placeholder='Ex. Pedro Henrique' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex.: meu.nome@email.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil de Acesso</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione um perfil' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.CustomerClient}>{getUserRoleText(UserRole.CustomerClient)}</SelectItem>
                    </SelectContent>
                  </Select>
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
