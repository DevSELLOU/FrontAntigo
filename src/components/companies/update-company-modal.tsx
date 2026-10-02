'use client'

import { updateCompanyAction } from '@/actions/company/update-company.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { GenericStatus } from '@/enums/generic-status.enum'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { Company } from '@/interfaces/company.interface'
import { CompanySchema } from '@/schemas/company.schema'
import { CompanyDto } from '@/types/dto/company-dto'
import { formatCnpj } from '@/utils/format/format-cnpj.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

interface ModalProps {
  open: boolean
  onClose: () => void
  company: Company
}

export function UpdateCompanyModal({ open, onClose, company }: ModalProps) {
  const { toast } = useToast()

  const [companyStatus, setCompanyStatus] = useState<GenericStatus>(company.status)

  const form = useForm<CompanyDto>({
    resolver: zodResolver(CompanySchema),
    defaultValues: {
      corporateName: company.corporateName,
      fantasyName: company.fantasyName,
      cnpj: company.cnpj
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const hasChanged =
        Object.keys(data).some(key => data[key as keyof CompanyDto] !== company[key as keyof Company]) ||
        companyStatus !== company.status

      if (hasChanged) {
        const response = await updateCompanyAction(company.id, { ...data, status: companyStatus })

        if (isApiErrorResponse(response)) {
          throw new CustomError(response.message)
        }

        toast({
          title: 'Empresa atualizada com sucesso',
          status: 'success'
        })
      }

      form.reset()
      onClose()
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao atualizar empresa'

      toast({
        title: message,
        status: 'error'
      })
    }
  })

  function onCompanyStatusChange(checked: boolean) {
    setCompanyStatus(checked ? GenericStatus.Active : GenericStatus.Inactive)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar empresa</DialogTitle>
          <DialogDescription>Altere os campos abaixo para atualizar a empresa.</DialogDescription>
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                      {...field}
                      value={formatCnpj(field.value)}
                      onChange={e => field.onChange(formatCnpj(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='company-status'
                  onCheckedChange={onCompanyStatusChange}
                  checked={companyStatus === GenericStatus.Active}
                />
                <Label htmlFor='company-status'>Ativa</Label>
              </div>

              <div className='flex items-center gap-3'>
                <Button type='button' variant='secondary' onClick={onClose}>
                  Cancelar
                </Button>
                <Button type='submit' disabled={form.formState.isSubmitting}>
                  Atualizar
                  {form.formState.isSubmitting && <Loading />}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
