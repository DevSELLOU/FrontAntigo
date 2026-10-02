'use client'

import { CheckCircle, Loader2, Mail, MapPin, Phone } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Customer } from '@/interfaces/customer.interface'
import { VisitRecord } from '@/interfaces/visit-record.interface'
import { cn } from '@/lib/utils'

export interface TripCustomer extends Customer {
  orderIndex: number
  visitRecord?: VisitRecord
  skipped: boolean
}

interface TripCustomerCardProps {
  customer: TripCustomer
  canRegisterVisit: boolean
  isSkipping: boolean
  onRegisterVisit: () => void
  onSkip: () => void
  formatDateTime: (dateString?: string) => string
}

export function TripCustomerCard({
  customer,
  canRegisterVisit,
  isSkipping,
  onRegisterVisit,
  onSkip,
  formatDateTime
}: TripCustomerCardProps) {
  // Same shape the screen already printed, kept as one string so it can wrap cleanly.
  const addressLine = [
    customer.address || '',
    customer.neighborhood ? ` - ${customer.neighborhood}` : '',
    customer.city ? `, ${customer.city}` : '',
    customer.UF ? ` - ${customer.UF}` : '',
    customer.cep ? ` • CEP: ${customer.cep}` : ''
  ].join('')

  return (
    <li
      className={cn(
        'rounded-2xl border bg-surface p-4 shadow-sm transition-colors',
        customer.visitRecord ? 'border-success-border' : 'border-border'
      )}
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex min-w-0 flex-1 items-start gap-3'>
          <span
            aria-hidden='true'
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#008440] text-label tabular-nums text-white'
          >
            {customer.orderIndex + 1}
          </span>

          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <h3 className='min-w-0 truncate text-h3 text-text'>
                <span className='sr-only'>Parada {customer.orderIndex + 1}: </span>
                {customer.fantasyName}
              </h3>
              {customer.visitRecord && (
                <CheckCircle className='h-5 w-5 shrink-0 text-success-foreground' aria-hidden='true' />
              )}
            </div>

            {customer.corporateName && (
              <p className='mt-0.5 truncate text-caption text-text-muted'>{customer.corporateName}</p>
            )}

            {addressLine && (
              <p className='mt-3 flex items-start gap-2 text-caption text-text-body'>
                <MapPin className='mt-0.5 h-4 w-4 shrink-0 text-text-muted' aria-hidden='true' />
                <span>{addressLine}</span>
              </p>
            )}

            {(customer.phoneNumber || customer.email) && (
              <div className='mt-1 flex flex-wrap items-center gap-x-4'>
                {customer.phoneNumber && (
                  <a
                    href={`tel:${customer.phoneNumber.replace(/\D/g, '')}`}
                    className='-mx-2 inline-flex h-11 items-center gap-2 rounded-lg px-2 text-caption text-text-body transition-colors hover:bg-surface-muted hover:text-[#008440]'
                  >
                    <Phone className='h-4 w-4 text-text-muted' aria-hidden='true' />
                    <span className='tabular-nums'>{customer.phoneNumber}</span>
                    <span className='sr-only'>— ligar para {customer.fantasyName}</span>
                  </a>
                )}

                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className='-mx-2 inline-flex h-11 min-w-0 items-center gap-2 rounded-lg px-2 text-caption text-text-body transition-colors hover:bg-surface-muted hover:text-[#008440]'
                  >
                    <Mail className='h-4 w-4 shrink-0 text-text-muted' aria-hidden='true' />
                    <span className='truncate'>{customer.email}</span>
                    <span className='sr-only'>— enviar e-mail para {customer.fantasyName}</span>
                  </a>
                )}
              </div>
            )}

            {customer.visitRecord && (
              <div className='mt-3 rounded-xl border border-success-border bg-success p-3'>
                <p className='flex items-center gap-2 text-caption font-medium text-success-foreground'>
                  <CheckCircle className='h-4 w-4 shrink-0' aria-hidden='true' />
                  <span>Visita realizada em {formatDateTime(customer.visitRecord.timestamp)}</span>
                </p>
                {customer.visitRecord.user && (
                  <p className='mt-1 text-caption text-success-foreground'>Por: {customer.visitRecord.user.name}</p>
                )}
                {customer.visitRecord.notes && (
                  <p className='mt-1 text-caption text-success-foreground'>{customer.visitRecord.notes}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className='shrink-0 sm:pl-2'>
          {customer.visitRecord ? (
            <StatusBadge variant='success'>Visitado</StatusBadge>
          ) : customer.skipped ? (
            <StatusBadge variant='warning'>Não visitado</StatusBadge>
          ) : canRegisterVisit ? (
            <div className='flex gap-2 sm:flex-col'>
              <Button type='button' className='h-11 flex-1 sm:flex-none' onClick={onRegisterVisit}>
                Registrar visita
              </Button>
              <Button
                type='button'
                variant='outline'
                className='h-11 flex-1 sm:flex-none'
                disabled={isSkipping}
                onClick={onSkip}
              >
                {isSkipping ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
                    <span className='sr-only'>Registrando…</span>
                  </>
                ) : (
                  'Não visitou'
                )}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  )
}
