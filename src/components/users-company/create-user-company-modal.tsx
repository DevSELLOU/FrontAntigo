'use client'

import { createUserCompanyAction } from '@/actions/user-company/create-user-company.action'
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

interface ModalProps {
  open: boolean
  onClose: () => void
  companyId: number
}

export function CreateUserCompanyModal({ open, onClose, companyId }: ModalProps): JSX.Element {
  const { toast } = useToast()

  const form = useForm<UserCompanyDto>({
    resolver: zodResolver(UserCompanySchema),
    defaultValues: {
      name: '',
      email: ''
    },
    mode: "onSubmit" // Trigger validation on form submission
  })

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = form;

  const onSubmit = handleSubmit(async (data) => { // Use handleSubmit from useForm
    try {
      const response = await createUserCompanyAction(companyId, data);

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message);
      }

      toast({
        title: 'Usuário criado com sucesso',
        status: 'success'
      });

      form.reset();
      onClose();
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao criar usuário';

      toast({
        title: message,
        status: 'error'
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar usuário</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para criar um novo usuário.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className='flex flex-col gap-4'> {/* Use the onSubmit function */}
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
                      <SelectItem value={UserRole.Ceo}>{getUserRoleText(UserRole.Ceo)}</SelectItem>
                      <SelectItem value={UserRole.CompanyAdministrator}>{getUserRoleText(UserRole.CompanyAdministrator)}</SelectItem>
                      <SelectItem value={UserRole.CustomerClient}>{getUserRoleText(UserRole.CustomerClient)}</SelectItem>
                      <SelectItem value={UserRole.DirectorOfSales}>{getUserRoleText(UserRole.DirectorOfSales)}</SelectItem>
                      <SelectItem value={UserRole.NationalManager}>{getUserRoleText(UserRole.NationalManager)}</SelectItem>
                      <SelectItem value={UserRole.RegionalManager}>{getUserRoleText(UserRole.RegionalManager)}</SelectItem>
                      <SelectItem value={UserRole.SalesCoordinator}>{getUserRoleText(UserRole.SalesCoordinator)}</SelectItem>
                      <SelectItem value={UserRole.SalesRep}>{getUserRoleText(UserRole.SalesRep)}</SelectItem>
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
              <Button type='submit' disabled={isSubmitting}> {/* Add type="submit" and use isSubmitting */}
                Criar
                {isSubmitting && <Loading />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
