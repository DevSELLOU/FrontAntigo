'use client'

import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { OrderStatus } from '@/enums/order-status.enum'
import { Order } from '@/interfaces/order.interface'
import { formatDateTime } from '@/utils/date.utils'
import { formatCurrency } from '@/utils/format/format-currency'
import { getOrderStatusBadgeStyle } from '@/utils/get-order-status-badge-style.util'
import { getOrderStatusText } from '@/utils/get-order-status-text.util'
import { ClipboardList, Clock, Package } from 'lucide-react'

interface PedidosTabProps {
  companyId: number
  customerId: number
  orders?: Order[]
}

/**
 * Same per-status tokens Orders uses (`getOrderStatusBadgeStyle`), instead of the nine hardcoded
 * Tailwind palettes this tab used to carry — those had no dark-mode pair, and drifted from the
 * colours the Orders screens show for the very same status.
 */
function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className='truncate shadow-none' style={getOrderStatusBadgeStyle(status)}>
      {getOrderStatusText(status)}
    </Badge>
  )
}

function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className='text-right'>Valor</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell className='font-medium tabular-nums'>#{order.id}</TableCell>
              <TableCell className='tabular-nums'>{formatDateTime(order.createdAt.toString())}</TableCell>
              <TableCell className='text-right tabular-nums'>{formatCurrency(order.totalValue)}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function PedidosTab({ orders = [] }: PedidosTabProps) {
  const pendingInvoices = orders.filter(order => order.status === OrderStatus.Approved)
  const otherOrders = orders.filter(order => order.status !== OrderStatus.Approved)

  if (orders.length === 0) {
    return (
      <Card className='rounded-2xl border-border bg-surface'>
        <CardContent className='flex h-48 flex-col items-center justify-center text-text-muted'>
          <ClipboardList className='mb-4 h-12 w-12 opacity-50' />
          <p className='text-h3'>Nenhum pedido encontrado</p>
          <p className='text-caption'>Os pedidos do cliente aparecerão aqui.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {pendingInvoices.length > 0 && (
        <Card className='rounded-2xl border-warning-border bg-warning'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-h3 text-text'>
              <Clock className='h-5 w-5 text-warning-foreground' />
              Títulos pendentes
              <StatusBadge variant='warning' className='ml-2 font-semibold tabular-nums'>
                {pendingInvoices.length}
              </StatusBadge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersTable orders={pendingInvoices} />
          </CardContent>
        </Card>
      )}

      <Card className='rounded-2xl border-border bg-surface'>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-h3 text-text'>
            <Package className='h-5 w-5 text-text-muted' />
            Histórico de pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {otherOrders.length > 0 ? (
            <OrdersTable orders={otherOrders} />
          ) : (
            <p className='py-4 text-center text-caption text-text-muted'>
              Todos os pedidos estão pendentes de faturamento.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
