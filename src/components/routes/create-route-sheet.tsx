'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { createRouteAction } from '@/actions/route/create-route.action'
import { searchCustomersAction } from '@/actions/customer/search-customers.action'
import { useToast } from '@/hooks/use-toast'
import { useState, useCallback } from 'react'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { Customer } from '@/interfaces/customer.interface'
import { Switch } from '@/components/ui/switch'
import { Search, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react'
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

interface CreateRouteSheetProps {
  open: boolean
  onClose: () => void
  companyId: number
}

interface SelectedCustomer {
  id: number
  fantasyName: string
  corporateName: string
  address: string
}

export function CreateRouteSheet({ open, onClose, companyId }: CreateRouteSheetProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [selectedCustomers, setSelectedCustomers] = useState<SelectedCustomer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false)
  const [isFixed, setIsFixed] = useState(false)

  const searchCustomers = useCallback(async (search: string) => {
    const result = await searchCustomersAction(companyId, search)
    if (!isApiErrorResponse(result) && Array.isArray(result.data)) {
      const filteredCustomers = result.data.filter(
        (c: Customer) => !selectedCustomers.some((sc) => sc.id === c.id)
      )
      setCustomerOptions(filteredCustomers)
    }
  }, [companyId, selectedCustomers])

  const handleSearchChange = (value: string) => {
    setCustomerSearch(value)
    if (value.length >= 2) {
      searchCustomers(value)
    } else {
      setCustomerOptions([])
    }
  }

  const handleAddCustomer = (customer: Customer) => {
    const newCustomer: SelectedCustomer = {
      id: customer.id,
      fantasyName: customer.fantasyName,
      corporateName: customer.corporateName,
      address: customer.address
    }
    setSelectedCustomers([...selectedCustomers, newCustomer])
    setCustomerSearch('')
    setCustomerOptions([])
    setCustomerPopoverOpen(false)
  }

  const handleRemoveCustomer = (customerId: number) => {
    setSelectedCustomers(selectedCustomers.filter((c) => c.id !== customerId))
  }

  const moveCustomer = (index: number, direction: 'up' | 'down') => {
    const newCustomers = [...selectedCustomers]
    if (direction === 'up' && index > 0) {
      ;[newCustomers[index], newCustomers[index - 1]] = [newCustomers[index - 1], newCustomers[index]]
    } else if (direction === 'down' && index < newCustomers.length - 1) {
      ;[newCustomers[index], newCustomers[index + 1]] = [newCustomers[index + 1], newCustomers[index]]
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
    const result = await createRouteAction(companyId, {
      name: name.trim(),
      description: description.trim(),
      scheduledDate: scheduledDate ? scheduledDate.toISOString().split('T')[0] : undefined,
      customerIds: selectedCustomers.map((c) => c.id),
      isFixed
    })
    setIsLoading(false)

    if (isApiErrorResponse(result)) {
      toast({ title: result.message, status: 'error' })
    } else {
      toast({ title: 'Rota criada com sucesso', status: 'success' })
      onClose()
      resetForm()
    }
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setScheduledDate(undefined)
    setSelectedCustomers([])
    setCustomerSearch('')
    setCustomerOptions([])
    setIsFixed(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className='w-full max-w-2xl flex flex-col'>
        <SheetHeader>
          <SheetTitle>Nova rota</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden'>
          <ScrollArea className='flex-1 py-4'>
            <div className='space-y-6 pr-1'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-text-body'>
                    Nome da rota *
                  </Label>
                  <Input
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Ex: Rota Centro - Segunda'
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-text-body'>Data programada</Label>
                  <DatePicker
                    value={scheduledDate}
                    onChange={setScheduledDate}
                    placeholder='Selecione uma data'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description' className='text-text-body'>
                  Descrição
                </Label>
                <Textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Descrição ou observações da rota...'
                  rows={2}
                />
              </div>

              <div className='flex h-11 items-center gap-2.5'>
                <Switch
                  id='isFixed'
                  checked={isFixed}
                  onCheckedChange={setIsFixed}
                />
                <Label
                  htmlFor='isFixed'
                  className='flex h-full flex-1 cursor-pointer items-center text-sm font-medium text-text-body'
                >
                  Rota fixa (recorrente)
                </Label>
              </div>

              <div className='space-y-2'>
                <Label className='text-text-body'>Clientes da rota</Label>
                <p className='text-caption text-text-muted'>
                  Adicione os clientes na ordem em que serão visitados. Use as setas para reordenar.
                </p>

                {selectedCustomers.length > 0 && (
                  <ol className='space-y-2 mb-4'>
                    {selectedCustomers.map((customer, index) => (
                      <li
                        key={customer.id}
                        className='flex items-center gap-2 rounded-xl border border-border bg-surface-muted p-2.5'
                      >
                        <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-sm font-semibold tabular-nums text-text-body'>
                          {index + 1}
                        </span>

                        <div className='flex-1 min-w-0'>
                          <p className='truncate font-medium text-text'>{customer.fantasyName}</p>
                          <p className='truncate text-caption text-text-muted'>{customer.address}</p>
                        </div>

                        {/* Touch targets: 44px each (design.md §11.3) — the rep reorders visits on a phone. */}
                        <div className='flex shrink-0 items-center'>
                          <Button
                            type='button'
                            variant='ghost'
                            className='h-11 w-11 p-0'
                            aria-label={`Subir ${customer.fantasyName} na ordem de visita`}
                            disabled={index === 0}
                            onClick={() => moveCustomer(index, 'up')}
                          >
                            <ChevronUp className='h-4 w-4' />
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            className='h-11 w-11 p-0'
                            aria-label={`Descer ${customer.fantasyName} na ordem de visita`}
                            disabled={index === selectedCustomers.length - 1}
                            onClick={() => moveCustomer(index, 'down')}
                          >
                            <ChevronDown className='h-4 w-4' />
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            className='h-11 w-11 p-0 text-danger-foreground hover:bg-danger hover:text-danger-foreground'
                            aria-label={`Remover ${customer.fantasyName} da rota`}
                            onClick={() => handleRemoveCustomer(customer.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}

                <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button type='button' variant='outline' className='h-11 w-full justify-between'>
                      <span className='flex items-center gap-2'>
                        <Plus className='h-4 w-4' />
                        Adicionar cliente
                      </span>
                      <Search className='h-4 w-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[min(400px,calc(100vw-2rem))] p-0' align='start'>
                    <Command>
                      <CommandInput
                        placeholder='Buscar cliente por nome...'
                        value={customerSearch}
                        onValueChange={handleSearchChange}
                      />
                      <CommandList className='max-h-[300px]'>
                        {customerOptions.length === 0 && customerSearch.length >= 2 ? (
                          <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        ) : customerSearch.length < 2 ? (
                          <CommandEmpty>Digite pelo menos 2 caracteres para buscar.</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {customerOptions.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                onSelect={() => handleAddCustomer(customer)}
                                className='min-h-[44px] cursor-pointer'
                              >
                                <div className='min-w-0'>
                                  <p className='truncate font-medium text-text'>{customer.fantasyName}</p>
                                  <p className='truncate text-caption text-text-muted'>{customer.address}</p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </ScrollArea>

          <div className='flex justify-end gap-2 border-t border-border pt-4'>
            <Button type='button' variant='outline' className='h-11' onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type='submit' className='h-11' disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar rota'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}