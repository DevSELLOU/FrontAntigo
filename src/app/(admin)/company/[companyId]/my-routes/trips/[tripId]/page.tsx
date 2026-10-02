'use client'

import { ChevronLeft, Navigation } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Trip } from '@/interfaces/trip.interface'
import { Customer } from '@/interfaces/customer.interface'
import { VisitRecord } from '@/interfaces/visit-record.interface'
import { fetchTripAction } from '@/actions/trip/fetch-trip.action'
import { fetchCustomersByIdsAction } from '@/actions/customer/fetch-customers-by-ids.action'
import { checkInAction } from '@/actions/trip/check-in.action'
import { CheckInModal } from '@/components/routes/check-in-modal'
import { CompleteTripModal } from '@/components/routes/complete-trip-modal'
import { TripCustomerCard } from '@/components/routes/trip-customer-card'
import { TripExecutionSkeleton } from '@/components/routes/trip-execution-skeleton'
import { TripStatusBadge } from '@/components/routes/trip-status-badge'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { ProgressBar } from '@/components/shared/progress-bar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { completeTripAction } from '@/actions/trip/complete-trip.action'
import { skipCustomerAction } from '@/actions/trip/skip-customer.action'

interface CustomerWithOrder extends Customer {
  orderIndex: number
  visitRecord?: VisitRecord
  skipped: boolean
}

export default function TripExecutionPage() {
  const params = useParams()
  const companyId = Number(params.companyId)
  const tripId = Number(params.tripId)
  const { user, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [customers, setCustomers] = useState<CustomerWithOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [checkInCustomer, setCheckInCustomer] = useState<Customer | null>(null)
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [skippingCustomerId, setSkippingCustomerId] = useState<number | null>(null)

  const routesHref = `/company/${companyId}/my-routes`

  const loadData = useCallback(async () => {
    setLoading(true)
    const tripResult = await fetchTripAction(companyId, tripId)

    if (!isApiErrorResponse(tripResult) && 'data' in tripResult) {
      const tripData = tripResult.data
      setTrip(tripData)

      // Load customers and match with visit records / scheduled visits
      const customerIds = tripData.customerIds || tripData.route?.customerIds || []
      if (customerIds.length) {
        const visitRecordMap = new Map<number, VisitRecord>()
        const skippedCustomerIds = new Set<number>()

        // Build visit record map
        if (tripData.visitRecords) {
          tripData.visitRecords.forEach(vr => {
            visitRecordMap.set(vr.customerId, vr)
          })
        }

        // Build skipped set from scheduled visits tied to this trip
        if (tripData.scheduledVisits) {
          tripData.scheduledVisits.forEach(sv => {
            skippedCustomerIds.add(sv.customerId)
          })
        }

        // Batch fetch all customers in a single request (avoids N+1)
        const res = await fetchCustomersByIdsAction(companyId, customerIds)
        if ('data' in res && Array.isArray(res.data)) {
          const customerMap = new Map(res.data.map(c => [c.id, c]))
          const loadedCustomers: CustomerWithOrder[] = customerIds
            .map((cid, orderIndex) => {
              const customer = customerMap.get(cid)
              if (!customer) return null
              return {
                ...customer,
                orderIndex,
                visitRecord: visitRecordMap.get(cid),
                skipped: skippedCustomerIds.has(cid)
              }
            })
            .filter(Boolean) as CustomerWithOrder[]
          setCustomers(loadedCustomers)
        }
      }
    }
    setLoading(false)
  }, [companyId, tripId])

  const userId = user?.id

  useEffect(() => {
    if (!userId) return
    loadData()
  }, [userId, loadData])

  const handleCompleteTrip = async (status: 'COMPLETED' | 'INCOMPLETE', completionNote?: string) => {
    const result = await completeTripAction(companyId, tripId, {
      status,
      completionNote
    })
    if (!isApiErrorResponse(result)) {
      setIsCompleteModalOpen(false)
      await loadData()
    }
  }

  const handleSkipCustomer = async (customerId: number) => {
    setSkippingCustomerId(customerId)
    const result = await skipCustomerAction(companyId, tripId, {
      customerId,
      scheduledNextVisit: new Date().toISOString().split('T')[0],
      notes: 'Cliente não visitado'
    })
    setSkippingCustomerId(null)
    if (!isApiErrorResponse(result)) {
      await loadData()
    } else {
      toast({ title: result.message, status: 'error' })
    }
  }

  const handleCheckIn = async (notes: string, scheduledNextVisit: string) => {
    if (!checkInCustomer || !trip) return

    const result = await checkInAction(companyId, trip.id, {
      customerId: checkInCustomer.id,
      notes,
      scheduledNextVisit
    })

    if (!isApiErrorResponse(result)) {
      setCheckInCustomer(null)
      setIsCheckInModalOpen(false)
      await loadData()
    }
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const visitedCount = customers.filter(c => c.visitRecord).length
  const visitedPercentage = customers.length > 0 ? (visitedCount / customers.length) * 100 : 0
  const isBusy = isAuthLoading || !user || loading

  const backLink = (
    <Link
      href={routesHref}
      className='-mx-2 inline-flex h-11 w-fit items-center gap-1.5 rounded-lg px-2 text-label text-brand-700 transition-colors hover:bg-surface-muted hover:text-brand-800'
    >
      <ChevronLeft className='h-4 w-4' aria-hidden='true' />
      Voltar para Minhas rotas
    </Link>
  )

  if (isBusy) {
    return (
      <>
        {backLink}
        <TripExecutionSkeleton />
      </>
    )
  }

  if (!trip) {
    return (
      <>
        {backLink}
        <section className='rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm'>
          <h1 className='text-h3 text-text'>Viagem não encontrada</h1>
          <p className='mx-auto mt-1 max-w-md text-body text-text-muted'>
            Ela pode ter sido removida ou pertencer a outro representante.
          </p>
          <Button asChild className='mt-5 h-11 px-6'>
            <Link href={routesHref}>Ver minhas rotas</Link>
          </Button>
        </section>
      </>
    )
  }

  return (
    <>
      {backLink}

      <ListingPageHeader
        card
        icon={<Navigation className='h-5 w-5' />}
        eyebrow='Viagem em andamento'
        title={trip.route?.name || 'Execução de viagem'}
        description={`${visitedCount} de ${customers.length} ${
          customers.length === 1 ? 'cliente visitado' : 'clientes visitados'
        }.`}
        showViewSelector={false}
        secondaryActions={
          <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
            <div className='flex h-11 items-center'>
              <TripStatusBadge status={trip.status} />
            </div>
            {trip.status === 'IN_PROGRESS' && (
              <Button type='button' className='h-11' onClick={() => setIsCompleteModalOpen(true)}>
                Finalizar viagem
              </Button>
            )}
          </div>
        }
      />

      {customers.length > 0 && (
        <section className='rounded-2xl border border-border bg-surface p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.08em] text-text-muted'>Progresso da rota</p>
            <p className='text-label tabular-nums text-text'>
              {visitedCount}/{customers.length}
            </p>
          </div>
          <ProgressBar
            percentage={visitedPercentage}
            label={`${visitedCount} de ${customers.length} clientes visitados`}
            className='mt-3'
          />
        </section>
      )}

      {customers.length === 0 ? (
        <section className='rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm'>
          <h2 className='text-h3 text-text'>Nenhum cliente nesta rota</h2>
          <p className='mx-auto mt-1 max-w-md text-body text-text-muted'>
            Adicione clientes à rota para registrar visitas.
          </p>
        </section>
      ) : (
        <ul className='flex flex-col gap-4'>
          {customers.map(customer => (
            <TripCustomerCard
              key={customer.id}
              customer={customer}
              canRegisterVisit={trip.status === 'IN_PROGRESS'}
              isSkipping={skippingCustomerId === customer.id}
              formatDateTime={formatDateTime}
              onRegisterVisit={() => {
                setCheckInCustomer(customer)
                setIsCheckInModalOpen(true)
              }}
              onSkip={() => handleSkipCustomer(customer.id)}
            />
          ))}
        </ul>
      )}

      {/* Check-in modal */}
      <CheckInModal
        open={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false)
          setCheckInCustomer(null)
        }}
        customer={checkInCustomer}
        tripId={tripId}
        companyId={companyId}
        routeName={trip.route?.name}
        routeDescription={trip.route?.description}
        previousNotes={
          checkInCustomer ? customers.find(c => c.id === checkInCustomer.id)?.visitRecord?.notes : undefined
        }
        onCheckIn={handleCheckIn}
      />
      <CompleteTripModal
        open={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        tripId={tripId}
        companyId={companyId}
        onComplete={handleCompleteTrip}
      />
    </>
  )
}
