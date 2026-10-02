'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { StatusBadge } from '@/components/shared/status-badge'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Route } from '@/interfaces/route.interface'
import { formatDateOnly } from '@/utils/date.utils'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { fetchUsersAction } from '@/actions/user/fetch-users.action'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DataTable } from '../ui/data-table'
import { SortableColumnHeader } from '../ui/sortable-column-header'
import { RemoveRouteModal } from './remove-route-modal'
import { RouteDetailModal } from './route-detail-modal'
import { RouteFormSheet } from './route-form-sheet'

interface RouteTableProps {
  routes: Route[]
  companyId: number
  onRefresh?: () => void
}

export function RouteTable({ routes, companyId, onRefresh }: RouteTableProps) {
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [removingRoute, setRemovingRoute] = useState<Route | null>(null)
  const [viewingRoute, setViewingRoute] = useState<Route | null>(null)
  const [userMap, setUserMap] = useState<Record<number, string>>({})

  useEffect(() => {
    const loadUsers = async () => {
      const result = await fetchUsersAction(companyId)
      if (!isApiErrorResponse(result) && Array.isArray(result.data)) {
        const map: Record<number, string> = {}
        result.data.forEach((user: { id: number; name: string }) => {
          map[user.id] = user.name
        })
        setUserMap(map)
      }
    }
    loadUsers()
  }, [companyId])

  // Sorting is uncontrolled here (unlike the paginated listings): the routes list arrives whole
  // from a single action, so reordering the loaded rows *is* reordering the whole result.
  const columns: ColumnDef<Route>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableColumnHeader column={column} label='Nome' />,
      cell: ({ row }) => <div className='truncate max-w-60 text-label text-text'>{row.getValue('name')}</div>
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <SortableColumnHeader column={column} label='Descrição' />,
      cell: ({ row }) => <div className='truncate max-w-72 text-text-muted'>{row.getValue('description') || '-'}</div>
    },
    {
      accessorKey: 'scheduledDate',
      header: ({ column }) => <SortableColumnHeader column={column} label='Data' />,
      cell: ({ row }) => (row.original.scheduledDate ? formatDateOnly(row.original.scheduledDate) : '-')
    },
    {
      id: 'sellers',
      enableSorting: false,
      header: 'Vendedores',
      cell: ({ row }) => {
        const userIds = row.original.userIds

        if (!userIds || userIds.length === 0) return <span className='text-text-muted'>-</span>

        return (
          <div className='flex flex-wrap gap-1'>
            {userIds.slice(0, 3).map(id => (
              <StatusBadge key={id} variant='neutral'>
                {userMap[id] || id}
              </StatusBadge>
            ))}
            {userIds.length > 3 && <StatusBadge variant='neutral'>+{userIds.length - 3}</StatusBadge>}
          </div>
        )
      }
    },
    {
      id: 'customers',
      enableSorting: false,
      header: 'Clientes',
      cell: ({ row }) => {
        const count = row.original.customerIds?.length || 0
        return <StatusBadge variant='info'>{count === 1 ? '1 cliente' : `${count} clientes`}</StatusBadge>
      }
    },
    {
      id: 'createdBy',
      enableSorting: false,
      header: 'Criado por',
      cell: ({ row }) => <span className='text-text-muted'>{row.original.createdBy?.name || '-'}</span>
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => <div className='text-right'>Ações</div>,
      cell: ({ row }) => {
        const route = row.original

        return (
          <TooltipProvider delayDuration={200}>
            <div className='flex items-center justify-end gap-1' onClick={event => event.stopPropagation()}>
              <RowActionButton label={`Visualizar rota ${route.name}`} onClick={() => setViewingRoute(route)}>
                <Eye className='h-4 w-4' />
              </RowActionButton>
              <RowActionButton label={`Editar rota ${route.name}`} onClick={() => setEditingRoute(route)}>
                <Pencil className='h-4 w-4' />
              </RowActionButton>
              <RowActionButton
                label={`Excluir rota ${route.name}`}
                onClick={() => setRemovingRoute(route)}
                className='hover:text-danger-foreground'
              >
                <Trash2 className='h-4 w-4' />
              </RowActionButton>
            </div>
          </TooltipProvider>
        )
      }
    }
  ]

  return (
    <>
      <DataTable columns={columns} data={routes} emptyMessage='Nenhuma rota encontrada. Crie uma para começar.' />

      {editingRoute && (
        <RouteFormSheet
          open={!!editingRoute}
          onClose={() => setEditingRoute(null)}
          companyId={companyId}
          route={editingRoute}
          onRefresh={onRefresh}
        />
      )}

      {viewingRoute && (
        <RouteDetailModal
          open={!!viewingRoute}
          onClose={() => setViewingRoute(null)}
          companyId={companyId}
          route={viewingRoute}
        />
      )}

      {removingRoute && (
        <RemoveRouteModal
          open={!!removingRoute}
          onClose={() => setRemovingRoute(null)}
          onRefresh={onRefresh}
          companyId={companyId}
          route={removingRoute}
        />
      )}
    </>
  )
}
