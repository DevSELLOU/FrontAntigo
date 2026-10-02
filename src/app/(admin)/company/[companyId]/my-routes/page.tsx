'use client'

import { MapPin } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { fetchRoutesAction } from '@/actions/route/fetch-my-routes.action'
import { fetchMyTripsAction } from '@/actions/trip/fetch-my-trips.action'
import { CreateRouteSheet } from '@/components/routes/create-route-sheet'
import { MyRoutesSkeleton } from '@/components/routes/my-routes-skeleton'
import { SellerRouteCard } from '@/components/routes/seller-route-card'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/use-auth'
import { Route } from '@/interfaces/route.interface'
import { Trip } from '@/interfaces/trip.interface'

interface PageProps {
  params: {
    companyId: number
  }
}

export default function MyRoutesPage({ params }: PageProps) {
  const companyId = params.companyId
  const { user, isLoading: isAuthLoading } = useAuth()
  const [routes, setRoutes] = useState<Route[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showOnlyMine, setShowOnlyMine] = useState(false)
  const [isCreateRouteOpen, setIsCreateRouteOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setHasError(false)
    const [routesResult, tripsResult] = await Promise.all([
      fetchRoutesAction(companyId),
      fetchMyTripsAction(companyId)
    ])

    if ('data' in routesResult) {
      setRoutes(routesResult.data || [])
    } else {
      setRoutes([])
      setHasError(true)
    }
    if ('data' in tripsResult) {
      setTrips(tripsResult.data || [])
    }
    setLoading(false)
  }, [companyId])

  const userId = user?.id

  useEffect(() => {
    if (!userId) return
    loadData()
  }, [userId, loadData])

  // Build map of routeId -> active trip
  const routeTripMap = new Map<number, Trip>()
  trips.forEach(trip => {
    if (trip.routeId && !routeTripMap.has(trip.routeId)) {
      routeTripMap.set(trip.routeId, trip)
    }
  })

  const filteredRoutes =
    showOnlyMine && user ? routes.filter(route => route.userIds?.includes(Number(user.id))) : routes

  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    if (!a.scheduledDate && !b.scheduledDate) return 0
    if (!a.scheduledDate) return 1
    if (!b.scheduledDate) return -1
    return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  })

  const isBusy = isAuthLoading || !user || loading

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ListingPageHeader
        card
        icon={<MapPin className='h-5 w-5' />}
        eyebrow='Visitas em campo'
        title='Minhas rotas'
        description='Inicie a viagem do dia e acompanhe as rotas de visita agendadas.'
        showViewSelector={false}
        primaryAction={{ label: 'Nova rota', onClick: () => setIsCreateRouteOpen(true) }}
        secondaryActions={
          <div className='flex h-11 w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 shadow-sm transition-colors hover:border-[var(--glass-hover-border)] hover:bg-[var(--glass-hover-bg)] sm:w-auto'>
            <Switch id='show-only-mine' checked={showOnlyMine} onCheckedChange={setShowOnlyMine} />
            <Label
              htmlFor='show-only-mine'
              className='flex h-full flex-1 cursor-pointer items-center whitespace-nowrap text-sm font-medium text-text-body'
            >
              Apenas minhas rotas
            </Label>
          </div>
        }
      />

      <CreateRouteSheet
        open={isCreateRouteOpen}
        onClose={() => {
          setIsCreateRouteOpen(false)
          loadData()
        }}
        companyId={companyId}
      />

      {isBusy ? (
        <MyRoutesSkeleton />
      ) : hasError ? (
        <section className='rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm'>
          <h2 className='text-h3 text-text'>Não foi possível carregar suas rotas.</h2>
          <p className='mx-auto mt-1 max-w-md text-body text-text-muted'>
            Verifique sua conexão e tente novamente.
          </p>
          <Button type='button' className='mt-5 h-11 px-6' onClick={loadData}>
            Tentar novamente
          </Button>
        </section>
      ) : sortedRoutes.length === 0 ? (
        <section className='rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm'>
          <span className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--glass-icon-bg)] text-[#008440]'>
            <MapPin className='h-6 w-6' />
          </span>
          <h2 className='mt-4 text-h3 text-text'>Nenhuma rota encontrada</h2>
          <p className='mx-auto mt-1 max-w-md text-body text-text-muted'>
            {showOnlyMine
              ? 'Nenhuma rota está atribuída a você. Desligue "Apenas minhas rotas" para ver todas.'
              : 'Crie uma rota para organizar as visitas do dia.'}
          </p>
          {!showOnlyMine && (
            <Button type='button' className='mt-5 h-11 px-6' onClick={() => setIsCreateRouteOpen(true)}>
              + Nova rota
            </Button>
          )}
        </section>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {sortedRoutes.map(route => (
            <SellerRouteCard
              key={route.id}
              route={route}
              companyId={companyId}
              trip={routeTripMap.get(route.id) || null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
