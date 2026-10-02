'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { createRouteAction } from '@/actions/route/create-route.action'
import { updateRouteAction } from '@/actions/route/update-route.action'
import { searchCustomersAction } from '@/actions/customer/search-customers.action'
import { fetchUsersAction } from '@/actions/user/fetch-users.action'
import { useToast } from '@/hooks/use-toast'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { Customer } from '@/interfaces/customer.interface'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronUp, ChevronDown, Plus, Trash2, Loader2, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Route } from '@/interfaces/route.interface'
import { parseDateOnly } from '@/utils/date.utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface RouteFormSheetProps {
  open: boolean
  onClose: () => void
  companyId: number
  route?: Route | null
  onRefresh?: () => void
}

interface SelectedCustomer {
  id: number
  fantasyName: string
  corporateName: string
  address: string
}

type CustomerListState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; customers: Customer[] }
  | { status: 'error'; message: string }
  | { status: 'searching'; query: string; customers: Customer[] }

export function RouteFormSheet({ open, onClose, companyId, route, onRefresh }: RouteFormSheetProps) {
  const { toast } = useToast()
  const isEditing = !!route
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [selectedUsers, setSelectedUsers] = useState<{ id: number; name: string; email: string }[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<SelectedCustomer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerListState, setCustomerListState] = useState<CustomerListState>({ status: 'idle' })
  const [isLoading, setIsLoading] = useState(false)
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false)
  const [userPopoverOpen, setUserPopoverOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userOptions, setUserOptions] = useState<{ id: number; name: string; email: string }[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const selectedCustomerIds = useMemo(() => new Set(selectedCustomers.map(c => c.id)), [selectedCustomers])
  const selectedUserIds = useMemo(() => new Set(selectedUsers.map(u => u.id)), [selectedUsers])

  useEffect(() => {
    if (open && route) {
      setName(route.name)
      setDescription(route.description || '')
      setScheduledDate(route.scheduledDate ? parseDateOnly(route.scheduledDate) : undefined)
      setSelectedUsers([])
      setSelectedCustomers([])
      if (route.customerIds?.length) {
        loadExistingCustomers(route.customerIds)
      }
      if (route.userIds?.length) {
        loadExistingUsers(route.userIds)
      }
    } else if (open && !route) {
      setName('')
      setDescription('')
      setScheduledDate(undefined)
      setSelectedUsers([])
      setSelectedCustomers([])
    }
  }, [open, route])

  const loadExistingUsers = async (userIds: number[]) => {
    try {
      const result = await fetchUsersAction(companyId)
      if (!isApiErrorResponse(result) && Array.isArray(result.data)) {
        const users = result.data.filter((u: any) => userIds.includes(u.id))
        setSelectedUsers(users.map((u: any) => ({ id: u.id, name: u.name, email: u.email })))
      }
    } catch (e) {
      console.error('Error loading users:', e)
    }
  }

  const loadUsers = async (search: string) => {
    setIsLoadingUsers(true)
    try {
      const result = await fetchUsersAction(companyId, search)
      if (!isApiErrorResponse(result) && Array.isArray(result.data)) {
        setUserOptions(result.data.filter((u: any) => !selectedUserIds.has(u.id)))
      }
    } catch (e) {
      console.error('Error loading users:', e)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleUserSearchChange = (value: string) => {
    setUserSearch(value)
    loadUsers(value)
  }

  const handleSelectUser = (user: { id: number; name: string; email: string }) => {
    setSelectedUsers(prev => [...prev, user])
    setUserPopoverOpen(false)
    setUserSearch('')
    setUserOptions([])
  }

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleUserPopoverOpen = (open: boolean) => {
    setUserPopoverOpen(open)
    if (open && userOptions.length === 0) {
      loadUsers('')
    }
  }

  const loadExistingCustomers = async (customerIds: number[]) => {
    setCustomerListState({ status: 'loading' })
    try {
      const result = await searchCustomersAction(companyId, '')
      if (!isApiErrorResponse(result) && Array.isArray(result.data)) {
        const customerMap = new Map(result.data.map((c: Customer) => [c.id, c]))
        const existing = customerIds
          .map(id => customerMap.get(id))
          .filter((c): c is Customer => c !== undefined)
          .map((c: Customer) => ({
            id: c.id,
            fantasyName: c.fantasyName,
            corporateName: c.corporateName,
            address: c.address
          }))
        setSelectedCustomers(existing)
      }
    } finally {
      setCustomerListState({ status: 'idle' })
    }
  }

  const fetchCustomers = useCallback(async (query: string = '') => {
    setCustomerListState({ status: 'loading' })
    try {
      const result = await searchCustomersAction(companyId, query)
      if (!isApiErrorResponse(result) && Array.isArray(result.data)) {
        const filtered = result.data.filter((c: Customer) => !selectedCustomerIds.has(c.id))
        setCustomerListState({ status: 'loaded', customers: filtered })
      } else {
        setCustomerListState({ status: 'error', message: 'Erro ao buscar clientes' })
      }
    } catch {
      setCustomerListState({ status: 'error', message: 'Erro ao buscar clientes' })
    }
  }, [companyId, selectedCustomerIds])

  const loadDefaultCustomers = useCallback(() => {
    if (customerListState.status !== 'loaded') {
      fetchCustomers('')
    }
  }, [customerListState.status, fetchCustomers])

  const handlePopoverOpenChange = (isOpen: boolean) => {
    setCustomerPopoverOpen(isOpen)
    if (isOpen) {
      setCustomerSearch('')
      loadDefaultCustomers()
    } else {
      setCustomerSearch('')
      setCustomerListState({ status: 'idle' })
    }
  }

  const handleSearchChange = (value: string) => {
    setCustomerSearch(value)
    if (value.length >= 2) {
      setCustomerListState({ status: 'searching', query: value, customers: [] })
      fetchCustomers(value)
    } else if (value.length === 0) {
      fetchCustomers('')
    }
  }

  const handleAddCustomer = (customer: Customer) => {
    const newCustomer: SelectedCustomer = {
      id: customer.id,
      fantasyName: customer.fantasyName,
      corporateName: customer.corporateName,
      address: customer.address
    }
    setSelectedCustomers(prev => [...prev, newCustomer])
    setCustomerSearch('')
    setCustomerPopoverOpen(false)
    setCustomerListState({ status: 'idle' })
  }

  const handleRemoveCustomer = (customerId: number) => {
    setSelectedCustomers(prev => prev.filter(c => c.id !== customerId))
  }

  const moveCustomer = (index: number, direction: 'up' | 'down') => {
    const newCustomers = [...selectedCustomers]
    if (direction === 'up' && index > 0) {
      [newCustomers[index], newCustomers[index - 1]] = [newCustomers[index - 1], newCustomers[index]]
    } else if (direction === 'down' && index < newCustomers.length - 1) {
      [newCustomers[index], newCustomers[index + 1]] = [newCustomers[index + 1], newCustomers[index]]
    }
    setSelectedCustomers(newCustomers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({ title: 'O nome da rota é obrigatório', status: 'error' })
      return
    }

    setIsLoading(true)
    
    const payload = {
      name: name.trim(),
      description: description.trim(),
      scheduledDate: scheduledDate ? scheduledDate.toISOString().split('T')[0] : undefined,
      userIds: selectedUsers.map(u => u.id),
      customerIds: selectedCustomers.map(c => c.id)
    }

    let result
    if (isEditing && route) {
      result = await updateRouteAction(companyId, route.id, payload)
    } else {
      result = await createRouteAction(companyId, payload)
    }
    
    setIsLoading(false)

    if (isApiErrorResponse(result)) {
      toast({ title: result.message, status: 'error' })
    } else {
      toast({ 
        title: isEditing ? 'Rota atualizada com sucesso' : 'Rota criada com sucesso', 
        status: 'success' 
      })
      onClose()
      onRefresh?.()
      if (!isEditing) {
        resetForm()
      }
    }
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setScheduledDate(undefined)
    setSelectedUsers([])
    setSelectedCustomers([])
    setCustomerSearch('')
    setCustomerListState({ status: 'idle' })
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      if (!isEditing) {
        resetForm()
      }
    }
    onClose()
  }

  const isLoadingCustomers = customerListState.status === 'loading' || customerListState.status === 'searching'
  
  const displayCustomers = (() => {
    if (customerListState.status === 'loaded') return customerListState.customers
    if (customerListState.status === 'searching') return customerListState.customers
    return []
  })()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='fixed inset-0 z-50 w-full h-full max-w-none xl:max-w-none rounded-none translate-x-0 translate-y-0 xl:h-full overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Rota' : 'Nova Rota'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden'>
          <ScrollArea className='flex-1 py-4'>
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Nome da Rota *</Label>
                  <Input
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Ex: Rota Centro - Segunda'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Data Programada</Label>
                  <div className='flex gap-2'>
                    <div className='flex-1'>
                      <DatePicker
                        value={scheduledDate}
                        onChange={setScheduledDate}
                        placeholder='Selecione uma data'
                      />
                    </div>
                    {scheduledDate && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => setScheduledDate(undefined)}
                        className='h-10 w-10 text-muted-foreground hover:text-foreground'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Descrição</Label>
                <Textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Descrição ou observações da rota...'
                  rows={2}
                />
              </div>

              <div className='space-y-2'>
                <Label>Vendedores Responsáveis (opcional)</Label>

                {selectedUsers.length > 0 && (
                  <div className='space-y-2 mb-2'>
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className='flex items-center gap-2 p-2 border rounded-lg bg-muted/30'
                      >
                        <div className='flex-1'>
                          <p className='font-medium'>{user.name}</p>
                          <p className='text-sm text-muted-foreground'>{user.email}</p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemoveUser(user.id)}
                          className='text-red-500 hover:text-red-600'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  type='button'
                  variant='outline'
                  className='w-full justify-between'
                  onClick={() => {
                    setUserPopoverOpen(true)
                    loadUsers('')
                  }}
                >
                  <span className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    Adicionar vendedor
                  </span>
                  <Search className='h-4 w-4' />
                </Button>
                <Popover open={userPopoverOpen} onOpenChange={handleUserPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div />
                  </PopoverTrigger>
                  <PopoverContent className='w-[400px] p-0' align='start'>
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder='Buscar vendedor por nome...'
                        value={userSearch}
                        onValueChange={handleUserSearchChange}
                      />
                      <CommandList className='max-h-[300px]'>
                        {isLoadingUsers ? (
                          <div className='flex items-center justify-center py-6'>
                            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                          </div>
                        ) : userOptions.length > 0 ? (
                          <CommandGroup>
                            {userOptions.map((user) => (
                              <CommandItem
                                key={user.id}
                                onSelect={() => handleSelectUser(user)}
                                className='cursor-pointer'
                              >
                                <div>
                                  <p className='font-medium'>{user.name}</p>
                                  <p className='text-sm text-muted-foreground'>{user.email}</p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ) : (
                          <CommandEmpty>Nenhum vendedor encontrado.</CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className='space-y-2'>
                <Label>Clientes da Rota</Label>
                <p className='text-sm text-muted-foreground'>
                  Adicione os clientes na ordem que serão visitados. Use as setas para reordenar.
                </p>

                {selectedCustomers.length > 0 && (
                  <div className='space-y-2 mb-4'>
                    {selectedCustomers.map((customer, index) => (
                      <div
                        key={customer.id}
                        className='flex items-center gap-2 p-3 border rounded-lg bg-muted/30'
                      >
                        <div className='flex flex-col gap-1'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            disabled={index === 0}
                            onClick={() => moveCustomer(index, 'up')}
                          >
                            <ChevronUp className='h-3 w-3' />
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            disabled={index === selectedCustomers.length - 1}
                            onClick={() => moveCustomer(index, 'down')}
                          >
                            <ChevronDown className='h-3 w-3' />
                          </Button>
                        </div>
                        <Badge variant='outline' className='w-8 h-6 flex items-center justify-center'>
                          {index + 1}
                        </Badge>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium truncate'>{customer.fantasyName}</p>
                          <p className='text-sm text-muted-foreground truncate'>{customer.address}</p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemoveCustomer(customer.id)}
                          className='text-red-500 hover:text-red-600'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Popover open={customerPopoverOpen} onOpenChange={handlePopoverOpenChange}>
                  <PopoverTrigger asChild>
                    <Button type='button' variant='outline' className='w-full justify-between'>
                      <span className='flex items-center gap-2'>
                        <Plus className='h-4 w-4' />
                        Adicionar cliente
                      </span>
                      <Search className='h-4 w-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[400px] p-0' align='start'>
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder='Buscar cliente por nome...'
                        value={customerSearch}
                        onValueChange={handleSearchChange}
                      />
                      <CommandList className='max-h-[300px]'>
                        {isLoadingCustomers ? (
                          <div className='flex items-center justify-center py-6'>
                            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                          </div>
                        ) : customerListState.status === 'error' ? (
                          <CommandEmpty>{(customerListState as { message: string }).message}</CommandEmpty>
                        ) : displayCustomers.length > 0 ? (
                          <CommandGroup>
                            {displayCustomers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                onSelect={() => handleAddCustomer(customer)}
                                className='cursor-pointer'
                              >
                                <div>
                                  <p className='font-medium'>{customer.fantasyName}</p>
                                  <p className='text-sm text-muted-foreground'>{customer.address}</p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ) : (
                          <CommandEmpty>
                            {customerSearch.length > 0 && customerSearch.length < 2 
                              ? 'Digite pelo menos 2 caracteres para buscar.' 
                              : 'Nenhum cliente disponível.'}
                          </CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </ScrollArea>

          <div className='flex justify-end gap-2 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar' : 'Criar Rota')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}