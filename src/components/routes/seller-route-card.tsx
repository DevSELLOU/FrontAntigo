'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Route } from '@/interfaces/route.interface'
import { Trip } from '@/interfaces/trip.interface'
import { RouteViewModal } from './route-view-modal'
import { TripStatusBadge } from './trip-status-badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users, ChevronRight, PlayCircle, ArrowRight, Repeat } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { formatDateOnly } from '@/utils/date.utils'
import { createTripAction } from '@/actions/trip/create-trip.action'
import { startTripAction } from '@/actions/trip/start-trip.action'

interface SellerRouteCardProps {
  route: Route
  companyId: number
  trip?: Trip | null
}

export function SellerRouteCard({ route, companyId, trip }: SellerRouteCardProps) {
  const [viewingRoute, setViewingRoute] = useState(false)
  const [starting, setStarting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const formatDate = (dateString?: string) => {
    return formatDateOnly(dateString)
  }

  const handleStartTrip = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!trip) return
    setStarting(true)
    try {
      const startResult = await startTripAction(companyId, trip.id)
      if (isApiErrorResponse(startResult)) {
        toast({ title: startResult.message, status: 'error' })
      } else {
        router.push(`/company/${companyId}/my-routes/trips/${trip.id}`)
      }
    } finally {
      setStarting(false)
    }
  }

  const handleCreateAndStartTrip = async (e: React.MouseEvent) => {
    e.stopPropagation()
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

  const handleContinueTrip = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (trip) {
      router.push(`/company/${companyId}/my-routes/trips/${trip.id}`)
    }
  }

  const customerCount = route.customerIds?.length || 0
  const showTripAction = !trip || trip.status === 'PENDING' || trip.status === 'IN_PROGRESS'

  return (
    <>
      <article className='group relative flex flex-col rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:border-[var(--glass-hover-border)] hover:shadow-md'>
        {/* Full-card target for the details modal. A button (not a div with onClick) so it is
            reachable by keyboard; the content above it is pointer-transparent so a tap anywhere
            still opens the details. */}
        <button
          type='button'
          onClick={() => setViewingRoute(true)}
          aria-label={`Ver detalhes da rota ${route.name}`}
          className='absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
        />

        <div className='pointer-events-none relative z-20 flex flex-1 flex-col gap-3'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <h3 className='min-w-0 text-h3 text-text'>{route.name}</h3>
                {route.isFixed && (
                  <span className='inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-body'>
                    <Repeat className='h-3 w-3' aria-hidden='true' />
                    Fixa
                  </span>
                )}
              </div>

              {route.description && (
                <p className='mt-1 line-clamp-2 text-caption text-text-muted'>{route.description}</p>
              )}

              {route.createdBy && (
                <p className='mt-1 text-caption text-text-muted'>Criada por: {route.createdBy.name}</p>
              )}
            </div>

            <div className='flex shrink-0 items-center gap-1'>
              <TripStatusBadge status={trip?.status} />
              <ChevronRight className='h-4 w-4 text-text-muted' aria-hidden='true' />
            </div>
          </div>

          <dl className='mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption text-text-body'>
            <div className='flex items-center gap-2'>
              <dt className='sr-only'>Data programada</dt>
              <Calendar className='h-4 w-4 text-text-muted' aria-hidden='true' />
              <dd className='tabular-nums'>{formatDate(route.scheduledDate)}</dd>
            </div>
            <div className='flex items-center gap-2'>
              <dt className='sr-only'>Clientes na rota</dt>
              <Users className='h-4 w-4 text-text-muted' aria-hidden='true' />
              <dd className='tabular-nums'>
                {customerCount} {customerCount === 1 ? 'cliente' : 'clientes'}
              </dd>
            </div>
          </dl>
        </div>

        {showTripAction && (
          <div className='pointer-events-none relative z-20 mt-4 border-t border-border pt-4'>
            <Button
              type='button'
              variant='default'
              className='pointer-events-auto h-11 w-full'
              onClick={
                !trip ? handleCreateAndStartTrip : trip.status === 'PENDING' ? handleStartTrip : handleContinueTrip
              }
              disabled={starting}
            >
              {trip && trip.status === 'IN_PROGRESS' ? (
                <>
                  <ArrowRight className='h-4 w-4' aria-hidden='true' />
                  Continuar viagem
                </>
              ) : (
                <>
                  <PlayCircle className='h-4 w-4' aria-hidden='true' />
                  {starting ? 'Iniciando...' : 'Iniciar viagem'}
                </>
              )}
            </Button>
          </div>
        )}
      </article>

      {viewingRoute && (
        <RouteViewModal
          open={viewingRoute}
          onClose={() => setViewingRoute(false)}
          companyId={companyId}
          route={route}
          trip={trip}
        />
      )}
    </>
  )
}
