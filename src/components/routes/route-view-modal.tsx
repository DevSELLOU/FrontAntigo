'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Route } from '@/interfaces/route.interface'
import { Trip } from '@/interfaces/trip.interface'
import { Customer } from '@/interfaces/customer.interface'
import { Button } from '@/components/ui/button'
import { TripStatusBadge } from './trip-status-badge'
import { Calendar, MapPin, Building, ChevronUp, ChevronDown, Loader2, PlayCircle, ArrowRight, CheckCircle2, ClipboardList } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { fetchCustomersByIdsAction } from '@/actions/customer/fetch-customers-by-ids.action'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { formatDateOnly } from '@/utils/date.utils'
import { createTripAction } from '@/actions/trip/create-trip.action'
import { startTripAction } from '@/actions/trip/start-trip.action'

interface RouteViewModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  route: Route
  trip?: Trip | null
}

interface CustomerWithOrder extends Customer {
  orderIndex: number
}

export function RouteViewModal({ open, onClose, companyId, route, trip }: RouteViewModalProps) {
  const [customers, setCustomers] = useState<CustomerWithOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCustomerId, setExpandedCustomerId] = useState<number | null>(null)
  const [starting, setStarting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (open && route.customerIds && route.customerIds.length > 0) {
      loadCustomers()
    } else if (open) {
      setLoading(false)
    }
  }, [open, route.customerIds])

  const loadCustomers = async () => {
    if (!route.customerIds || route.customerIds.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Single batched request. This used to be one sequential round trip per customer,
    // which on a phone in the field meant a 12-stop route waited on 12 requests.
    const result = await fetchCustomersByIdsAction(companyId, route.customerIds)

    if ('data' in result && Array.isArray(result.data)) {
      const customerMap = new Map(result.data.map(c => [c.id, c]))
      const loadedCustomers = route.customerIds
        .map((customerId, orderIndex) => {
          const customer = customerMap.get(customerId)
          return customer ? { ...customer, orderIndex } : null
        })
        .filter(Boolean) as CustomerWithOrder[]

      setCustomers(loadedCustomers)
    }

    setLoading(false)
  }

  const formatDate = (dateString?: string) => {
    return formatDateOnly(dateString) || 'Sem data definida'
  }

  const handleCreateAndStartTrip = async () => {
    if (!user?.id) return
    setStarting(true)
    try {
      // Create the trip first
      const createResult = await createTripAction(companyId, {
        routeId: route.id,
        scheduledDate: route.scheduledDate,
        userId: Number(user.id)
      })

      if (isApiErrorResponse(createResult)) {
        toast({ title: createResult.message, status: 'error' })
        setStarting(false)
        return
      }

      const newTrip = createResult.data

      // Start the trip
      const startResult = await startTripAction(companyId, newTrip.id)
      if (isApiErrorResponse(startResult)) {
        toast({ title: startResult.message, status: 'error' })
      } else {
        router.push(`/company/${companyId}/my-routes/trips/${newTrip.id}`)
      }
    } finally {
      setStarting(false)
    }
  }

  const handleGoToTrip = () => {
    if (trip) {
      router.push(`/company/${companyId}/my-routes/trips/${trip.id}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md max-h-[80vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>{route.name}</DialogTitle>
          {route.scheduledDate && (
            <div className='mt-1 flex items-center gap-2 text-caption text-text-muted'>
              <Calendar className='h-4 w-4' aria-hidden='true' />
              <span>{formatDate(route.scheduledDate)}</span>
            </div>
          )}
        </DialogHeader>

        <div className='flex-1 overflow-y-auto'>
          {route.description && <p className='mb-4 text-caption text-text-muted'>{route.description}</p>}

          <h3 className='mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted'>
            Clientes ({customers.length})
          </h3>

          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin text-text-muted' />
              <span className='sr-only'>Carregando clientes…</span>
            </div>
          ) : customers.length === 0 ? (
            <p className='py-4 text-center text-body text-text-muted'>Nenhum cliente nesta rota</p>
          ) : (
            <ol className='max-h-96 space-y-2 overflow-y-auto pr-2'>
              {customers.map((customer) => (
                <li
                  key={customer.id}
                  className='overflow-hidden rounded-xl border border-border'
                >
                  <button
                    type='button'
                    aria-expanded={expandedCustomerId === customer.id}
                    className='flex w-full items-center justify-between gap-3 bg-surface-muted p-4 text-left transition-colors hover:bg-[var(--glass-hover-bg)]'
                    onClick={() => setExpandedCustomerId(
                      expandedCustomerId === customer.id ? null : customer.id
                    )}
                  >
                    <span className='flex min-w-0 items-center gap-3'>
                      <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#008440] text-sm font-medium tabular-nums text-white'>
                        {customer.orderIndex + 1}
                      </span>
                      <span className='min-w-0'>
                        <span className='block truncate font-medium text-text'>{customer.fantasyName}</span>
                        <span className='block truncate text-caption text-text-muted'>{customer.corporateName}</span>
                      </span>
                    </span>
                    {expandedCustomerId === customer.id ? (
                      <ChevronUp className='h-5 w-5 shrink-0 text-text-muted' aria-hidden='true' />
                    ) : (
                      <ChevronDown className='h-5 w-5 shrink-0 text-text-muted' aria-hidden='true' />
                    )}
                  </button>

                  {expandedCustomerId === customer.id && (
                    <div className='border-t border-border bg-surface p-4'>
                      <div className='space-y-3 text-caption'>
                        <div className='flex items-start gap-2'>
                          <Building className='mt-0.5 h-4 w-4 shrink-0 text-text-muted' aria-hidden='true' />
                          <div>
                            <p className='font-medium text-text'>Razão social</p>
                            <p className='text-text-muted'>{customer.corporateName}</p>
                          </div>
                        </div>
                        {customer.address && (
                          <div className='flex items-start gap-2'>
                            <MapPin className='mt-0.5 h-4 w-4 shrink-0 text-text-muted' aria-hidden='true' />
                            <div>
                              <p className='font-medium text-text'>Endereço</p>
                              <p className='text-text-muted'>
                                {customer.address}
                                {customer.neighborhood && ` - ${customer.neighborhood}`}
                                {customer.city && ` - ${customer.city}`}
                                {customer.UF && `, ${customer.UF}`}
                                {customer.cep && ` - CEP: ${customer.cep}`}
                              </p>
                            </div>
                          </div>
                        )}
                        {customer.phoneNumber && (
                          <a
                            href={`tel:${customer.phoneNumber.replace(/\D/g, '')}`}
                            className='-mx-2 flex h-11 items-center gap-2 rounded-lg px-2 transition-colors hover:bg-surface-muted hover:text-[#008440]'
                          >
                            <span className='font-medium text-text'>Telefone:</span>
                            <span className='tabular-nums text-text-muted'>{customer.phoneNumber}</span>
                          </a>
                        )}
                        {customer.email && (
                          <a
                            href={`mailto:${customer.email}`}
                            className='-mx-2 flex h-11 min-w-0 items-center gap-2 rounded-lg px-2 transition-colors hover:bg-surface-muted hover:text-[#008440]'
                          >
                            <span className='shrink-0 font-medium text-text'>E-mail:</span>
                            <span className='truncate text-text-muted'>{customer.email}</span>
                          </a>
                        )}

                        {(() => {
                          const visitRecord = trip?.visitRecords?.find(vr => vr.customerId === customer.id)
                          if (visitRecord) {
                            return (
                              <div className='mt-3 rounded-xl border border-success-border bg-success p-3'>
                                <div className='mb-1 flex items-center gap-2 font-medium text-success-foreground'>
                                  <CheckCircle2 className='h-4 w-4 shrink-0' aria-hidden='true' />
                                  <span>Visita realizada</span>
                                </div>
                                <div className='flex items-center gap-2 text-xs text-success-foreground'>
                                  <span>
                                    {visitRecord.timestamp
                                      ? new Date(visitRecord.timestamp).toLocaleString('pt-BR')
                                      : ''}
                                  </span>
                                  {visitRecord.user && (
                                    <>
                                      <span>·</span>
                                      <span className='font-medium'>
                                        {visitRecord.user.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {visitRecord.notes && (
                                  <div className='mt-2 flex items-start gap-2'>
                                    <ClipboardList
                                      className='mt-0.5 h-4 w-4 shrink-0 text-success-foreground'
                                      aria-hidden='true'
                                    />
                                    <div>
                                      <p className='text-xs font-medium text-success-foreground'>Observação</p>
                                      <p className='text-caption text-success-foreground'>{visitRecord.notes}</p>
                                    </div>
                                  </div>
                                )}
                                {visitRecord.latitude && visitRecord.longitude && (
                                  <p className='mt-1 text-xs text-success-foreground'>
                                    Localização: {visitRecord.latitude}, {visitRecord.longitude}
                                  </p>
                                )}
                              </div>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        <DialogFooter className='flex-col gap-2 sm:flex-row'>
          <div className='self-center'>
            <TripStatusBadge status={trip?.status} />
          </div>
          <div className='ml-auto flex gap-2'>
            <Button type='button' variant='outline' className='h-11' onClick={onClose}>
              Fechar
            </Button>
            {trip ? (
              <Button
                type='button'
                variant='default'
                className='h-11'
                onClick={handleGoToTrip}
                disabled={trip.status === 'COMPLETED' || trip.status === 'CANCELLED'}
              >
                <ArrowRight className='h-4 w-4' aria-hidden='true' />
                Ir para viagem
              </Button>
            ) : (
              <Button
                type='button'
                variant='default'
                className='h-11'
                onClick={handleCreateAndStartTrip}
                disabled={starting}
              >
                <PlayCircle className='h-4 w-4' aria-hidden='true' />
                {starting ? 'Iniciando...' : 'Iniciar viagem'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}