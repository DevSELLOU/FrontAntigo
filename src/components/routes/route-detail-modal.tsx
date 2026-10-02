'use client'

import { useEffect, useState } from 'react'
import { Route } from '@/interfaces/route.interface'
import { Customer } from '@/interfaces/customer.interface'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, MapPin, Building, User } from 'lucide-react'
import { formatDateOnly } from '@/utils/date.utils'
import { fetchUsersAction } from '@/actions/user/fetch-users.action'
import { fetchCustomerByIdAction } from '@/actions/customer/fetch-customer-by-id.action'
import { fetchAllTripsAction } from '@/actions/trip/fetch-all-trips.action'
import { Trip } from '@/interfaces/trip.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'

interface RouteDetailModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  route: Route
}

export function RouteDetailModal({
  open,
  onClose,
  companyId,
  route,
}: RouteDetailModalProps) {
  const [users, setUsers] = useState<{ id: number; name: string; email: string }[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingTrips, setLoadingTrips] = useState(false)

  useEffect(() => {
    if (!open) return

    const loadUsers = async () => {
      if (!route.userIds?.length) {
        setUsers([])
        return
      }
      setLoadingUsers(true)
      const result = await fetchUsersAction(companyId)
      if (!isApiErrorResponse(result) && Array.isArray(result.data)) {
        const matched = result.data.filter((u: any) =>
          route.userIds!.includes(u.id)
        )
        setUsers(matched.map((u: any) => ({ id: u.id, name: u.name, email: u.email })))
      }
      setLoadingUsers(false)
    }

    const loadCustomers = async () => {
      if (!route.customerIds?.length) {
        setCustomers([])
        return
      }
      setLoadingCustomers(true)
      const results = await Promise.all(
        route.customerIds.map((id) => fetchCustomerByIdAction(id, companyId))
      )
      const valid = results
        .filter((r) => !isApiErrorResponse(r) && 'data' in r)
        .map((r) => (r as { data: Customer }).data)
      setCustomers(valid)
      setLoadingCustomers(false)
    }

    const loadTrips = async () => {
      setLoadingTrips(true)
      const result = await fetchAllTripsAction(companyId)
      if (!isApiErrorResponse(result) && 'data' in result) {
        const allTrips = result.data as Trip[]
        const routeTrips = allTrips.filter((t) => t.routeId === route.id)
        setTrips(routeTrips)
      }
      setLoadingTrips(false)
    }

    loadUsers()
    loadCustomers()
    loadTrips()
  }, [open, route, companyId])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MapPin className='h-5 w-5 text-primary' />
            {route.name}
          </DialogTitle>
          <DialogDescription>
            Detalhes da rota e vendedores associados
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Scheduled date */}
          <div className='flex items-center gap-2 text-sm'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <span className='text-muted-foreground'>Data agendada:</span>
            <span className='font-medium'>
              {route.scheduledDate ? formatDateOnly(route.scheduledDate) : 'Sem data agendada'}
            </span>
          </div>

          {/* Description */}
          {route.description && (
            <div className='text-sm text-muted-foreground border-l-2 border-primary/30 pl-3'>
              {route.description}
            </div>
          )}

          {/* Sellers */}
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Vendedores associados
            </h3>
            {loadingUsers ? (
              <div className='space-y-2'>
                <div className='h-8 w-full bg-muted animate-pulse rounded' />
                <div className='h-8 w-full bg-muted animate-pulse rounded' />
              </div>
            ) : users.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                Nenhum vendedor associado
              </p>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {users.map((user) => (
                  <Badge key={user.id} variant='secondary' className='flex items-center gap-1'>
                    <User className='h-3 w-3' />
                    {user.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visit Records */}
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold flex items-center gap-2'>
              <MapPin className='h-4 w-4' />
              Registros de Visita
              <span className='text-muted-foreground font-normal'>
                ({trips.reduce((count, t) => count + (t.visitRecords?.length || 0), 0)})
              </span>
            </h3>
            {loadingTrips ? (
              <div className='space-y-2'>
                <div className='h-10 w-full bg-muted animate-pulse rounded' />
                <div className='h-10 w-full bg-muted animate-pulse rounded' />
              </div>
            ) : trips.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                Nenhuma viagem registrada para esta rota
              </p>
            ) : (
              <div className='space-y-4'>
                {trips.map((trip) => (
                  <div key={trip.id} className='space-y-2'>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Calendar className='h-3 w-3' />
                      <span>
                        Viagem #{trip.id} - {trip.status} - {trip.scheduledDate || 'Sem data'}
                      </span>
                    </div>
                    {trip.visitRecords && trip.visitRecords.length > 0 ? (
                      <div className='space-y-2'>
                        {trip.visitRecords.map((vr) => (
                          <div
                            key={vr.id}
                            className='flex items-start gap-2 p-2 border rounded-md bg-yellow-50/50'
                          >
                            <div className='min-w-0 flex-1'>
                              <div className='flex items-center gap-2'>
                                <p className='text-sm font-medium'>
                                  {customers.find((c) => c.id === vr.customerId)?.fantasyName ||
                                    `Cliente #${vr.customerId}`}
                                </p>
                                {vr.user && (
                                  <Badge variant='outline' className='text-[10px] px-1 py-0 h-4'>
                                    {vr.user.name}
                                  </Badge>
                                )}
                              </div>
                              {vr.notes && (
                                <p className='text-sm text-muted-foreground mt-0.5'>
                                  {vr.notes}
                                </p>
                              )}
                              <p className='text-xs text-muted-foreground mt-0.5'>
                                {vr.timestamp
                                  ? new Date(vr.timestamp).toLocaleString('pt-BR')
                                  : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-xs text-muted-foreground pl-1'>
                        Sem registros de visita
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customers */}
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold flex items-center gap-2'>
              <Building className='h-4 w-4' />
              Clientes
              <span className='text-muted-foreground font-normal'>
                ({route.customerIds?.length || 0})
              </span>
            </h3>
            {loadingCustomers ? (
              <div className='space-y-2'>
                <div className='h-10 w-full bg-muted animate-pulse rounded' />
                <div className='h-10 w-full bg-muted animate-pulse rounded' />
                <div className='h-10 w-full bg-muted animate-pulse rounded' />
              </div>
            ) : customers.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                Nenhum cliente associado
              </p>
            ) : (
              <div className='space-y-2'>
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className='flex items-start gap-2 p-2 border rounded-md bg-muted/20'
                  >
                    <Building className='h-4 w-4 text-muted-foreground mt-0.5 shrink-0' />
                    <div className='min-w-0'>
                      <p className='text-sm font-medium truncate'>
                        {customer.fantasyName}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {customer.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
