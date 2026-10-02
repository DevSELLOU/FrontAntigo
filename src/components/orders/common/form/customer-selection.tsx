'use client'

import { Info, Search } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Customer } from '@/interfaces/customer.interface'
import { useCustomerSearch } from '@/hooks/queries/use-customers'
import { formatCpfCnpj } from '@/utils/format/format-cpf-cnpj.util'
import { formatCurrency } from '@/utils/format/format-currency'
import { getCustomerCreditStatus, getCustomerCreditStatusClasses } from '@/utils/get-customer-credit-status'
import { CustomerDetailModal } from '../customer-detail-modal'

interface CustomerSelectionProps {
  customers: Customer[]
  selectedCustomer: Customer | null
  onSelectCustomer: (customer: Customer | null) => void
  disabled?: boolean
  companyId: number
}

export function CustomerSelection({
  customers,
  selectedCustomer,
  onSelectCustomer,
  disabled = false,
  companyId
}: CustomerSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [customerDetailModalOpen, setCustomerDetailModalOpen] = useState(false)
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null)

  // Use React Query for cached customer search
  const { data: searchedCustomersData, isLoading: isSearching } = useCustomerSearch(
    companyId,
    searchTerm,
    searchTerm.length >= 2
  )

  const searchedCustomers = searchedCustomersData && 'data' in searchedCustomersData
    ? searchedCustomersData.data
    : []

  const filteredCustomers = searchTerm ? searchedCustomers : customers

  const handleOpenCustomerDetail = (customer: Customer) => {
    setSelectedCustomerDetail(customer)
    setCustomerDetailModalOpen(true)
  }

  const handleCloseCustomerDetail = () => {
    setSelectedCustomerDetail(null)
    setCustomerDetailModalOpen(false)
  }

  const handleClearCustomer = () => {
    onSelectCustomer(null)
  }

  return (
    // Plain block, not a Card: this already renders inside the form's section card,
    // and nesting one card in another doubled the border.
    <div className='w-full space-y-4'>
        <div className='relative w-full'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-text-muted' />
          <Input
            placeholder='Buscar cliente por nome ou CNPJ...'
            className='pl-8 w-full'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            disabled={disabled || Boolean(selectedCustomer)}
          />
        </div>

        {selectedCustomer ? (
          <div className='mb-4 border-b border-border pb-4'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='text-label text-text'>Cliente selecionado</h3>
              <Button variant='outline' size='sm' className='rounded-xl' onClick={handleClearCustomer} disabled={disabled}>
                Alterar
              </Button>
            </div>
            <SelectedCustomerItem customer={selectedCustomer} />
          </div>
        ) : (
          <div>
            {isSearching ? (
              <div className='py-8 text-center text-body text-text-muted'>Buscando clientes...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className='py-8 text-center text-body text-text-muted'>
                {searchTerm ? 'Nenhum cliente encontrado com os filtros atuais' : 'Nenhum cliente disponível'}
              </div>
            ) : (
              <ScrollArea className='h-[250px] pr-4'>
                <div className='space-y-3'>
                  {filteredCustomers.map(customer => (
                    <CustomerListItem
                      key={customer.id}
                      customer={customer}
                      onSelect={() => onSelectCustomer(customer)}
                      disabled={disabled}
                      onOpenDetail={handleOpenCustomerDetail}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <CustomerDetailModal
          isOpen={customerDetailModalOpen}
          onClose={handleCloseCustomerDetail}
          customer={selectedCustomerDetail}
        />
    </div>
  )
}

interface CustomerListItemProps {
  customer: Customer
  onSelect: () => void
  disabled?: boolean
  onOpenDetail: (customer: Customer) => void
}

function CustomerListItem({ customer, onSelect, disabled, onOpenDetail }: CustomerListItemProps) {
  const creditStatus = getCustomerCreditStatus(customer)
  const statusClass = getCustomerCreditStatusClasses(creditStatus.status)

  const limit = formatCurrency(Number(customer.creditLimit))
  const used = formatCurrency(Number(customer.creditLimitUsed))

  return (
    <div
      className='cursor-pointer rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-border-strong hover:bg-surface-muted'
      onClick={disabled ? undefined : onSelect}
    >
      <div className='flex gap-3'>
        <div className='relative h-16 w-16 flex-shrink-0'>
          <div className='flex h-full w-full items-center justify-center rounded-xl border border-border bg-surface-muted text-center text-lg font-bold text-text-muted'>
            {customer.fantasyName.charAt(0)}
          </div>
        </div>

        <div className='flex flex-col flex-1 min-w-0 gap-1'>
          <div className='flex items-start justify-between gap-1 flex-wrap'>
            <h3 className='line-clamp-1 text-label text-text'>{customer.fantasyName}</h3>
            <Badge className={`rounded-full text-center text-xs shadow-none ${statusClass}`}>{creditStatus.label}</Badge>
          </div>

          <div className='mt-1 flex flex-wrap gap-2'>
            <span className='text-xs text-text-muted'>CPF/CNPJ: {formatCpfCnpj(customer.document)}</span>
            {customer.city && customer.UF && (
              <span className='ml-1 text-xs text-text-muted'>
                • {customer.city}/{customer.UF}
              </span>
            )}
          </div>

          <div className='mt-1 flex w-full flex-wrap items-center justify-between gap-2 text-xs tabular-nums text-text-body'>
            <span>Limite: {limit}</span>
            <span>Utilizado: {used}</span>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 ml-2 flex-shrink-0'
                onClick={e => {
                  e.stopPropagation()
                  onOpenDetail(customer)
                }}
              >
                <Info className='h-4 w-4' />
                <span className='sr-only'>Detalhes</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver detalhes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

interface SelectedCustomerItemProps {
  customer: Customer
}

function SelectedCustomerItem({ customer }: SelectedCustomerItemProps) {
  const creditStatus = getCustomerCreditStatus(customer)
  const statusClass = getCustomerCreditStatusClasses(creditStatus.status)

  const limit = formatCurrency(Number(customer.creditLimit))
  const used = formatCurrency(Number(customer.creditLimitUsed))

  return (
    <div className='rounded-2xl border border-border bg-surface p-3'>
      <div className='flex gap-3'>
        <div className='relative h-16 w-16 flex-shrink-0'>
          <div className='flex h-full w-full items-center justify-center rounded-xl border border-border bg-surface-muted text-center text-lg font-bold text-text-muted'>
            {customer.fantasyName.charAt(0)}
          </div>
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='line-clamp-2 text-label text-text'>{customer.fantasyName}</h3>
            <Badge className={`rounded-full text-center text-xs shadow-none ${statusClass}`}>{creditStatus.label}</Badge>
          </div>

          <div className='mt-1 flex flex-wrap gap-1'>
            <span className='text-xs text-text-muted'>CPF/CNPJ: {customer.document}</span>
            <span className='ml-1 text-xs text-text-muted'>• {customer.corporateName}</span>
          </div>

          <div className='mt-1 flex items-center gap-2'>
            <div className='flex w-full items-center justify-between gap-2 text-xs tabular-nums text-text-body'>
              <span>Limite: {limit}</span>
              <span>Utilizado: {used}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
