'use client'

import { updateAccessRequestStatusAction } from '@/actions/access-request/update-access-request-status.action'
import { AccessRequestStatus } from '@/enums/access-request-status.enum'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { AccessRequests } from '@/interfaces/access-requests.interface'
import { Customer } from '@/interfaces/customer.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { cn } from '@/lib/utils'
import { UpdateAccessRequestStatusSchema } from '@/schemas/update-access-request-status.schema'
import { UpdateAccessRequestStatusDto } from '@/types/dto/update-access-request-status-dto'
import { clientFetch } from '@/utils/client-fetch.util'
import { getAccessRequestStatusText } from '@/utils/get-access-request-status-text.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface ModalProps {
  open: boolean
  onClose: VoidFunction
  accessRequest: AccessRequests
}

export function UpdateAccessRequestStatus({ open, onClose, accessRequest }: ModalProps) {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [commandOpen, setCommandOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const form = useForm<UpdateAccessRequestStatusDto>({
    resolver: zodResolver(UpdateAccessRequestStatusSchema),
    defaultValues: {
      status: accessRequest.status ?? AccessRequestStatus.Realized,
      customerId: accessRequest.customerId ?? undefined
    }
  })

  async function fetchCustomers(search?: string) {
    if (!accessRequest.customerId && open) {
      setIsLoadingCustomers(true)
      try {
        const params = new URLSearchParams()
        if (search) {
          params.append('query', search)
          params.append('limit', '10')
          params.append('page', '1')
          params.append(
            'sort',
            JSON.stringify({
              fantasyName: 'ASC'
            })
          )
        }

        const customersResponse = await clientFetch<PaginatedResponse<Customer>>(
          `/company/${accessRequest.companyId}/customer${search ? `?${params.toString()}` : ''}`,
          { method: 'GET' }
        )

        if (!isApiErrorResponse(customersResponse)) {
          setCustomers(customersResponse.data)
        } else {
          toast({
            title: customersResponse.message || 'Erro ao carregar clientes',
            status: 'error'
          })
        }
      } catch {
        toast({
          title: 'Erro ao carregar clientes',
          status: 'error'
        })
      } finally {
        setIsLoadingCustomers(false)
      }
    }
  }

  async function fetchInitialCustomer() {
    if (accessRequest.customerId && open) {
      setIsLoadingCustomers(true)
      try {
        const customerResponse = await clientFetch<Customer>(
          `/company/${accessRequest.companyId}/customer/${accessRequest.customerId}`,
          { method: 'GET' }
        )

        if (!isApiErrorResponse(customerResponse)) {
          setSelectedCustomer(customerResponse)
        }
      } catch {
        toast({
          title: 'Erro ao carregar cliente',
          status: 'error'
        })
      } finally {
        setIsLoadingCustomers(false)
      }
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers(searchTerm)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [accessRequest.companyId, accessRequest.customerId, open, searchTerm])

  useEffect(() => {
    if (open) {
      fetchInitialCustomer()
    }
  }, [open])

  useEffect(() => {
    const customerId = form.watch('customerId')
    if (customerId) {
      const customer = customers.find(c => c.id === Number(customerId))
      if (customer) {
        setSelectedCustomer(customer)
      }
    }
  }, [customers, form.watch('customerId')])

  const onSubmit = form.handleSubmit(async data => {
    try {
      const response = await updateAccessRequestStatusAction(accessRequest.companyId, accessRequest.id, data)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Atualizado com sucesso',
        status: 'success'
      })

      form.reset()
      onClose()
    } catch (error: any) {
      const title = error?.message ?? 'Não foi possível atualizar o status.'

      toast({
        title,
        status: 'error'
      })
    }
  })

  const status = form.watch('status')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Requisição de Acesso</DialogTitle>
          <DialogDescription>
            Empresa: <Badge variant='outline'>{accessRequest.companyName}</Badge>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className='flex flex-col gap-4 w-full'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione um tipo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(AccessRequestStatus).map(type => (
                        <SelectItem key={type} value={type}>
                          {getAccessRequestStatusText(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {!accessRequest.customerId && status === AccessRequestStatus.Realized && (
              <FormField
                control={form.control}
                name='customerId'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel>Cliente</FormLabel>
                    <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={commandOpen}
                            className='w-full justify-between'
                            disabled={isLoadingCustomers}
                          >
                            {selectedCustomer ? selectedCustomer.fantasyName : 'Selecione um cliente'}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-[--radix-popover-trigger-width] p-0 max-h-[400px] overflow-y-auto'>
                        <Command>
                          <CommandInput
                            placeholder='Buscar cliente...'
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                          />
                          <CommandEmpty className='py-2 px-2 text-sm text-muted-foreground'>
                            {isLoadingCustomers ? 'Carregando...' : 'Nenhum cliente encontrado'}
                          </CommandEmpty>
                          <CommandGroup>
                            {customers.map(customer => (
                              <CommandItem
                                key={customer.id}
                                value={customer.fantasyName}
                                onSelect={() => {
                                  field.onChange(customer.id.toString())
                                  setSelectedCustomer(customer)
                                  setCommandOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedCustomer?.id === customer.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {customer.fantasyName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            )}

            <div className='flex justify-end gap-2 mt-4'>
              <Button type='button' variant='secondary' onClick={onClose}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isLoadingCustomers}>
                Salvar
                {(form.formState.isSubmitting || isLoadingCustomers) && <Loading />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
