'use client'

import { fetchRoutesAction } from '@/actions/route/fetch-my-routes.action'
import { fetchScheduledVisitsAction } from '@/actions/scheduled-visit/fetch-scheduled-visits.action'
import { fetchVisitHistoryAction } from '@/actions/visit-record/fetch-visit-history.action'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import type { HistoryEntry } from '@/interfaces/history-entry.interface'
import { Route } from '@/interfaces/route.interface'
import type { ScheduledVisit } from '@/interfaces/scheduled-visit.interface'
import type { VisitRecord } from '@/interfaces/visit-record.interface'
import { MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { RouteFormSheet } from './route-form-sheet'
import { RouteTable } from './route-table'
import { VisitHistoryTable } from './visit-history-table'
import { CreateVisitDialog } from './create-visit-dialog'
import { ScheduledVisitsTable } from './scheduled-visits-table'
import { Button } from '@/components/ui/button'

interface CompanyRoutesProps {
  companyId: number
}

export function CompanyRoutes({ companyId }: CompanyRoutesProps) {
  const { user, isLoading: isAuthLoading } = useAuth()

  const [routes, setRoutes] = useState<Route[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isVisitOpen, setIsVisitOpen] = useState(false)
  const [scheduledVisits, setScheduledVisits] = useState<ScheduledVisit[]>([])

  useEffect(() => {
    if (user) {
      loadData()
    }

    const handleFocus = () => {
      if (user) loadData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, companyId])

  const loadData = async () => {
    setLoading(true)
    const [routesResult, historyResult, scheduledResult] = await Promise.all([
      fetchRoutesAction(companyId),
      fetchVisitHistoryAction(companyId),
      fetchScheduledVisitsAction(companyId)
    ])

    if ('data' in routesResult) setRoutes(routesResult.data || [])

    const visitRecords: VisitRecord[] = 'data' in historyResult ? historyResult.data || [] : []
    const scheduledVisits: ScheduledVisit[] = 'data' in scheduledResult ? scheduledResult.data || [] : []
    setScheduledVisits(scheduledVisits)

    const merged: HistoryEntry[] = [
      ...visitRecords.map(vr => ({
        id: vr.id,
        type: 'visit' as const,
        customerId: vr.customerId,
        customer: vr.customer,
        userId: vr.userId,
        user: vr.user,
        companyId: vr.companyId,
        timestamp: vr.timestamp,
        notes: vr.notes,
        source: vr.source,
        isOutsideRoute: vr.isOutsideRoute,
        scheduledNextVisit: vr.scheduledNextVisit,
        latitude: vr.latitude,
        longitude: vr.longitude,
        routeName: vr.trip?.route?.name,
        routeDescription: vr.trip?.route?.description,
        routeScheduledDate: vr.trip?.route?.scheduledDate,
        routeCustomerCount: vr.trip?.route?.customerIds?.length,
        routeUserCount: vr.trip?.route?.userIds?.length,
        routeCreatedBy: vr.trip?.route?.createdBy
      })),
      ...scheduledVisits.map(sv => ({
        id: sv.id,
        type: (!sv.sourceTripId && !sv.sourceVisitRecordId ? 'scheduled' : 'skip') as HistoryEntry['type'],
        scheduledStatus: sv.status,
        scheduledTime: sv.scheduledTime,
        customerId: sv.customerId,
        customer: sv.customer,
        userId: sv.userId,
        user: sv.user,
        companyId: sv.companyId,
        timestamp: sv.createdAt,
        notes: sv.notes,
        source: undefined,
        isOutsideRoute: undefined,
        scheduledNextVisit: sv.scheduledDate,
        latitude: undefined,
        longitude: undefined,
        routeName: sv.sourceTrip?.route?.name,
        routeDescription: sv.sourceTrip?.route?.description,
        routeScheduledDate: sv.sourceTrip?.route?.scheduledDate,
        routeCustomerCount: sv.sourceTrip?.route?.customerIds?.length,
        routeUserCount: sv.sourceTrip?.route?.userIds?.length,
        routeCreatedBy: sv.sourceTrip?.route?.createdBy
      }))
    ]

    merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setHistory(merged)
    setLoading(false)
  }

  // Both lists arrive whole from the actions above, so search filters in memory — there is no
  // paginated endpoint behind this screen to push a query to.
  const term = query.trim().toLowerCase()

  const filteredRoutes = useMemo(() => {
    if (!term) return routes
    return routes.filter(route =>
      [route.name, route.description, route.createdBy?.name].some(value => value?.toLowerCase().includes(term))
    )
  }, [routes, term])

  const filteredHistory = useMemo(() => {
    if (!term) return history
    return history.filter(entry =>
      [entry.customer?.fantasyName, entry.customer?.corporateName, entry.user?.name, entry.routeName].some(value =>
        value?.toLowerCase().includes(term)
      )
    )
  }, [history, term])

  if (isAuthLoading || !user) {
    return (
      <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
        <div className='flex h-64 items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ListingPageHeader
        card
        icon={<MapPin className='h-5 w-5' />}
        eyebrow='Gerenciamento'
        title='Rotas'
        description='Planeje as rotas de visita e acompanhe o que a equipe já visitou.'
        searchValue={query}
        onSearch={setQuery}
        showViewSelector={false}
        primaryAction={{ label: 'Nova rota', onClick: () => setIsCreateOpen(true) }}
        secondaryActions={user.role !== 'CUSTOMER_CLIENT' && <Button variant='outline' onClick={() => setIsVisitOpen(true)}>+ Nova visita</Button>}
      />

      {/* Same capsule as `shared/segmented-tab-nav.tsx`, but driven by Radix state instead of an
          `<a href>`: this screen loads its data on the client, and a link would hard-navigate and
          refetch all three endpoints on every tab switch. */}
      <Tabs defaultValue='routes' className='w-full'>
        <TabsList className='flex flex-wrap h-auto min-h-[52px] w-full justify-start gap-1 rounded-2xl border border-border bg-surface p-1'>
          <TabsTrigger value='agenda' className='min-h-[44px] rounded-xl px-4 py-2.5 text-label text-text-muted data-[state=active]:bg-[var(--glass-icon-bg)] data-[state=active]:font-semibold data-[state=active]:text-[#008440]'>Visitas agendadas</TabsTrigger>
          <TabsTrigger
            value='routes'
            className='min-h-[44px] rounded-xl px-4 py-2.5 text-label text-text-muted data-[state=active]:bg-[var(--glass-icon-bg)] data-[state=active]:font-semibold data-[state=active]:text-[#008440]'
          >
            Rotas
          </TabsTrigger>
          <TabsTrigger
            value='history'
            className='min-h-[44px] rounded-xl px-4 py-2.5 text-label text-text-muted data-[state=active]:bg-[var(--glass-icon-bg)] data-[state=active]:font-semibold data-[state=active]:text-[#008440]'
          >
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value='routes' className='mt-4'>
          <RouteTable routes={filteredRoutes} companyId={companyId} onRefresh={loadData} />
        </TabsContent>
        <TabsContent value='agenda' className='mt-4'>
          <ScheduledVisitsTable visits={scheduledVisits.filter(visit => !term || [visit.customer?.fantasyName, visit.customer?.corporateName, visit.user?.name].some(value => value?.toLowerCase().includes(term)))} loading={loading} />
        </TabsContent>

        <TabsContent value='history' className='mt-4'>
          <VisitHistoryTable records={filteredHistory} loading={loading} />
        </TabsContent>
      </Tabs>

      <RouteFormSheet
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        companyId={companyId}
        onRefresh={loadData}
      />
      <CreateVisitDialog open={isVisitOpen} onClose={() => setIsVisitOpen(false)} companyId={companyId} onCreated={loadData} />
    </div>
  )
}
