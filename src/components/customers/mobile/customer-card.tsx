'use client'

import { ExternalLink, Eye, Trash2 } from 'lucide-react'

import { RowActionButton } from '@/components/shared/row-action-button'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CountryState } from '@/enums/country-state.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { Customer } from '@/interfaces/customer.interface'
import { cn } from '@/lib/utils'
import { CustomerWrapper } from '@/types/customer-wrapper.type'
import { getCreditLimitUsage } from '@/utils/customers/credit-limit.util'
import { formatCpfCnpj } from '@/utils/format/format-cpf-cnpj.util'
import { formatPhoneNumber } from '@/utils/format/format-phone.util'
import { formatToShortNumber } from '@/utils/format/format-to-short-number.util'
import { getCustomerStatusText } from '@/utils/get-customer-status-text.util'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { RemoveCustomerModal } from '../common/remove-customer-modal'
import { CustomerProfileSheet } from '../profile/customer-profile-sheet'

interface CustomerCardProps {
  customerWrapper: CustomerWrapper
  customer: Customer
}

const STATUS_VARIANT: Record<CustomerStatus, 'success' | 'neutral' | 'danger'> = {
  [CustomerStatus.Active]: 'success',
  [CustomerStatus.Inactive]: 'neutral',
  [CustomerStatus.Defaulting]: 'danger'
}

/** Same thresholds as `getCustomerCreditStatus`, so bar colour and its label can never disagree. */
function creditBarClass(percent: number): string {
  if (percent >= 90) return 'bg-danger-foreground'
  if (percent >= 70) return 'bg-warning-foreground'
  return 'bg-success-foreground'
}

export default function CustomerCard({ customerWrapper, customer }: CustomerCardProps) {
  const router = useRouter()
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false)
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)

  const credit = getCreditLimitUsage(customer)

  const subSegmentsMap = useMemo(() => {
    return customerWrapper?.segments?.flatMap(({ subSegments }) => subSegments) || []
  }, [customerWrapper])

  const getSubSegmentName = (): string => {
    if (!customer?.subSegmentId) return '-'
    return subSegmentsMap.find(({ id }) => id === Number(customer?.subSegmentId))?.name || '-'
  }

  const status = customer?.status ?? CustomerStatus.Active
  const openSheet = () => setIsSheetOpen(true)
  const openProfile = () => router.push(`/company/${customerWrapper.companyId}/customers/${customer.id}`)

  return (
    <>
      <Card
        role='button'
        tabIndex={0}
        aria-label={`Ver detalhes de ${customer?.fantasyName}`}
        onClick={openSheet}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openSheet()
          }
        }}
        className='group flex h-full min-w-0 cursor-pointer flex-col gap-4 rounded-2xl border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--glass-hover-border)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35DD48]/40'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 space-y-1'>
            <p className='line-clamp-1 text-label font-semibold text-text'>{customer?.fantasyName}</p>
            <p className='line-clamp-1 text-caption text-text-muted'>{customer?.corporateName}</p>
          </div>

          <div className='flex shrink-0 flex-col items-end gap-1.5'>
            <span className='rounded-full border border-border bg-surface-muted px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-text-muted'>
              #{customer?.id.toString().padStart(4, '0')}
            </span>
            <StatusBadge variant={STATUS_VARIANT[status] ?? 'neutral'} className='font-semibold'>
              {getCustomerStatusText(status)}
            </StatusBadge>
          </div>
        </div>

        <dl className='grid gap-2 text-caption'>
          <div className='flex justify-between gap-3'>
            <dt className='text-text-muted'>Cidade/Estado</dt>
            <dd className='truncate text-end text-text-body'>
              {`${customer?.city}/${CountryState[customer?.UF as CountryState]}`}
            </dd>
          </div>
          <div className='flex justify-between gap-3'>
            <dt className='text-text-muted'>Telefone</dt>
            <dd className='truncate text-end text-text-body tabular-nums'>{formatPhoneNumber(customer?.phoneNumber)}</dd>
          </div>
          <div className='flex justify-between gap-3'>
            <dt className='text-text-muted'>CPF/CNPJ</dt>
            <dd className='truncate text-end text-text-body tabular-nums'>{formatCpfCnpj(customer?.document)}</dd>
          </div>
          <div className='flex justify-between gap-3'>
            <dt className='text-text-muted'>Segmento</dt>
            <dd className='truncate text-end text-text-body'>{getSubSegmentName()}</dd>
          </div>
        </dl>

        <div className='space-y-1.5'>
          <div className='flex items-center justify-between gap-3 text-caption'>
            <span className='text-text-muted'>Limite de crédito</span>
            <span className='text-text-body tabular-nums'>
              {formatToShortNumber(credit.used)}/{formatToShortNumber(credit.total)}
            </span>
          </div>
          <div
            role='progressbar'
            aria-label='Limite de crédito utilizado'
            aria-valuenow={Math.round(credit.percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            className='h-2 w-full overflow-hidden rounded-full bg-border'
          >
            <div
              className={cn('h-full rounded-full transition-all', creditBarClass(credit.percent))}
              style={{ width: `${credit.percent}%` }}
            />
          </div>
        </div>

        <div className='mt-auto flex items-center justify-between gap-3 border-t border-border pt-3'>
          <span className='truncate text-caption text-text-muted'>Atualizado {howTimeAgo(customer?.updatedAt)}</span>

          <TooltipProvider delayDuration={200}>
            <div className='flex shrink-0 items-center gap-1' onClick={event => event.stopPropagation()}>
              <RowActionButton label='Abrir perfil' onClick={openProfile}>
                <ExternalLink className='h-4 w-4' />
              </RowActionButton>

              <RowActionButton label='Ver detalhes' onClick={openSheet}>
                <Eye className='h-4 w-4' />
              </RowActionButton>

              <RowActionButton label='Remover cliente' onClick={() => setIsRemoveModalOpen(true)}>
                <Trash2 className='h-4 w-4' />
              </RowActionButton>
            </div>
          </TooltipProvider>
        </div>
      </Card>

      <CustomerProfileSheet
        customer={customer}
        companyId={customerWrapper.companyId}
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {isRemoveModalOpen && (
        <RemoveCustomerModal open={isRemoveModalOpen} onClose={() => setIsRemoveModalOpen(false)} customer={customer} />
      )}
    </>
  )
}
