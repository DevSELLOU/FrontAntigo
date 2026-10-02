'use client'

import { useUrlSorting } from '@/hooks/use-url-sorting'
import { Order } from '@/interfaces/order.interface'
import { cn } from '@/lib/utils'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { formatCurrency } from '@/utils/format/format-currency'
import { formatItemId } from '@/utils/format/format-item-id.util'
import { getOrderItemsSummary } from '@/utils/get-order-items-summary'
import { getOrderStatusBadgeStyle } from '@/utils/get-order-status-badge-style.util'
import { getOrderStatusText } from '@/utils/get-order-status-text.util'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import { safeTableValue } from '@/utils/safe-table-value'
import { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import { Badge } from '../../ui/badge'
import { DataTable } from '../../ui/data-table'
import { SortableColumnHeader } from '../../ui/sortable-column-header'
import { OrderRowOptions } from './order-row-options'

interface TableProps {
  orderWrapper: OrderWrapper
}

const VISIBILITY_STORAGE_KEY = 'orders-table-columns'

const DEFAULT_VISIBILITY: VisibilityState = {
  observation: false,
  paymentProgress: false
}

const TOGGLEABLE_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'customer', label: 'Cliente' },
  { id: 'responsible', label: 'Responsável' },
  { id: 'status', label: 'Status' },
  { id: 'totalValue', label: 'Valor total' },
  { id: 'orderItems', label: 'Produtos' },
  { id: 'paymentCondition', label: 'Condição de pagamento' },
  { id: 'observation', label: 'Observações' },
  { id: 'paymentProgress', label: 'Progresso pagamento' },
  { id: 'updatedAt', label: 'Atualizado em' }
]

export function OrdersTable({ orderWrapper }: TableProps) {
  const router = useRouter()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(DEFAULT_VISIBILITY)
  const { sorting, handleSortingChange } = useUrlSorting()

  useEffect(() => {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY)
    if (saved) {
      try {
        setColumnVisibility(JSON.parse(saved))
      } catch {
        // ignore malformed storage value
      }
    }
  }, [])

  const handleColumnVisibilityChange = (visibility: VisibilityState) => {
    setColumnVisibility(visibility)
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibility))
  }

  const toggleColumn = (id: string, visible: boolean) => {
    handleColumnVisibilityChange({ ...columnVisibility, [id]: visible })
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <SortableColumnHeader column={column} label='ID' />,
      cell: ({ row }) => formatItemId(row.getValue('id'))
    },
    {
      id: 'customer',
      accessorFn: order => orderWrapper.customers.find(customer => customer.id === order.customerId)?.fantasyName ?? '',
      // Not sortable: the backend orders by real `Orders` columns only (`buildSortQuery` pushes the
      // field straight into Sequelize's `order`), so asking it for `customer` would blow up the query.
      enableSorting: false,
      header: 'Cliente',
      cell: ({ row }) => {
        const order = row.original
        const customer = orderWrapper.customers.find(customer => customer.id === order.customerId)

        return (
          <div>
            <div className='font-bold text-text'>{safeTableValue(customer?.fantasyName)}</div>
            {customer?.city && (
              <div className='text-caption text-text-muted'>
                {customer.city}/{customer.UF}
              </div>
            )}
          </div>
        )
      }
    },
    {
      id: 'responsible',
      accessorFn: order => order.responsibleUsers?.[0]?.name ?? '',
      enableSorting: false,
      header: 'Responsável',
      cell: ({ row }) => {
        const order = row.original

        const responsibleUsers =
          order.responsibleUsers && order.responsibleUsers.length > 0
            ? order.responsibleUsers
            : orderWrapper.users
                .map(user => ({ id: (user as any)?.user?.id ?? user.id, name: (user as any)?.user?.name ?? user.name }))
                .filter(user => user.id === order.responsibleUserId)

        return (
          <div className='flex flex-wrap gap-1'>
            {responsibleUsers.length === 0 ? (
              safeTableValue('-')
            ) : (
              responsibleUsers.map(user => (
                <Badge key={user.id} variant='secondary'>
                  {user.name}
                </Badge>
              ))
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <SortableColumnHeader column={column} label='Status' />,
      cell: ({ row }) => {
        const status = row.original.status
        const statusText = getOrderStatusText(status)
        const statusStyle = getOrderStatusBadgeStyle(status)

        return (
          <Badge className='truncate rounded-full font-semibold shadow-none' style={statusStyle}>
            {statusText}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'totalValue',
      header: ({ column }) => <SortableColumnHeader column={column} label='Valor total' />,
      cell: ({ row }) => {
        const totalValue = row.original.totalValue
        const discountValue = row.original.discount

        return (
          <div className='flex truncate items-center gap-2'>
            <span>{formatCurrency(totalValue)}</span>
            {discountValue > 0 ? <Badge variant='outline'>-{formatCurrency(discountValue)}</Badge> : null}
          </div>
        )
      }
    },
    {
      id: 'orderItems',
      accessorFn: order => order.orderItems?.length ?? 0,
      enableSorting: false,
      header: 'Produtos',
      cell: ({ row }) => {
        const { displayedProducts, remainingCount } = getOrderItemsSummary(
          row.original.orderItems,
          orderWrapper.products
        )

        return (
          <div className='line-clamp-2'>
            {displayedProducts || '-'} {remainingCount > 0 ? <Badge variant='outline'>+{remainingCount}</Badge> : null}
          </div>
        )
      }
    },
    {
      id: 'paymentCondition',
      accessorFn: order =>
        orderWrapper?.customers
          ?.find(customer => customer.id === order.customerId)
          ?.paymentConditions.find(paymentCondition => paymentCondition.id === order.paymentConditionId)?.name ?? '',
      enableSorting: false,
      header: 'Condição de pagamento',
      cell: ({ getValue }) => safeTableValue(getValue() as string)
    },
    {
      accessorKey: 'observation',
      header: ({ column }) => <SortableColumnHeader column={column} label='Observações' />,
      cell: ({ row }) => <div className='truncate'>{row.getValue('observation') || '-'}</div>
    },
    {
      id: 'paymentProgress',
      accessorFn: order => (order.totalValue > 0 ? (order.amountPaid / order.totalValue) * 100 : 0),
      enableSorting: false,
      header: 'Progresso pagamento',
      cell: ({ row }) => {
        const order = row.original
        const total = order.totalValue
        const amountPaid = order.amountPaid

        const progress = total > 0 ? (amountPaid / total) * 100 : 0

        return (
          <div className='flex items-center gap-2'>
            <div
              className={cn('w-1.5 h-1.5 rounded-full', {
                'bg-success-foreground': progress === 100,
                'bg-info-foreground': progress > 0 && progress < 100,
                'bg-text-muted': progress === 0
              })}
            />
            <span>{progress.toFixed(0)}%</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <SortableColumnHeader column={column} label='Atualizado em' />,
      cell: ({ row }) => howTimeAgo(row.getValue('updatedAt'))
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => (
        <div className='flex justify-end'>
          <ColumnVisibilityToggle
            columns={TOGGLEABLE_COLUMNS}
            visibility={columnVisibility}
            onToggle={toggleColumn}
            extraColumnIds={['observation', 'paymentProgress']}
            onReset={() => handleColumnVisibilityChange(DEFAULT_VISIBILITY)}
          />
        </div>
      ),
      cell: ({ row }) => {
        const order = row.original

        return (
          <div className='flex items-center justify-end' onClick={e => e.stopPropagation()}>
            <OrderRowOptions order={order} orderWrapper={orderWrapper} />
          </div>
        )
      }
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={orderWrapper.orders}
      onRowClick={order => router.push(`/company/${orderWrapper.companyId}/orders/edit/${order.id}`)}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={handleColumnVisibilityChange}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      emptyMessage='Nenhum pedido encontrado com os filtros selecionados.'
    />
  )
}
