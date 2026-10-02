'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import { ColumnDef } from '@tanstack/react-table'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { DataTable } from '@/components/ui/data-table'
import { SortableColumnHeader } from '@/components/ui/sortable-column-header'
import { KpiGrid } from '@/components/shared/kpi-grid'
import { ReportCard, ReportEmptyState, REPORT_CHART_BOX, REPORT_CHART_GRID_CLASS } from '@/components/reports/report-blocks'
import { getOrderStatusBadgeStyle } from '@/utils/get-order-status-badge-style.util'
import { getOrderStatusText } from '@/utils/get-order-status-text.util'
import { formatCurrency } from '@/utils/format/format-currency'
import type { OrderStatus } from '@/enums/order-status.enum'
import { BarChart3, ShoppingCart, Table2, TrendingDown, Wallet } from 'lucide-react'

export interface OrdersReportRow {
  orderId: number
  orderStatus: string
  totalValue: number
  createdAt: string
  customerName: string
  customerDocument: string
  customerSegment: string
  customerUF: string
  customerGroup: string
  paymentCondition: string
  amountPaid: number
  discount: number
  itemsCount: number
  itemsTotalValue: number
}

interface OrdersReportViewProps {
  data: OrdersReportRow[]
}

const formatNumber = (value: number): string => new Intl.NumberFormat('pt-BR').format(value)

const chartConfig = {
  count: { label: 'Pedidos' }
} satisfies ChartConfig

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className='inline-flex items-center rounded-full px-3 py-1 text-xs font-medium'
      style={getOrderStatusBadgeStyle(status as OrderStatus)}
    >
      {getOrderStatusText(status as OrderStatus) ?? status}
    </span>
  )
}

export default function OrdersReportView({ data }: OrdersReportViewProps) {
  const totals = useMemo(
    () =>
      data.reduce(
        (acc, row) => {
          acc.totalValue += row.totalValue
          acc.amountPaid += row.amountPaid
          acc.discount += row.discount
          acc.itemsCount += row.itemsCount
          return acc
        },
        { totalValue: 0, amountPaid: 0, discount: 0, itemsCount: 0 }
      ),
    [data]
  )

  const chartData = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of data) {
      const status = row.orderStatus || 'unknown'
      map.set(status, (map.get(status) || 0) + 1)
    }

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => ({
        status,
        label: getOrderStatusText(status as OrderStatus) ?? status,
        count
      }))
  }, [data])

  const columns = useMemo<ColumnDef<OrdersReportRow>[]>(
    () => [
      {
        accessorKey: 'orderId',
        header: ({ column }) => <SortableColumnHeader column={column} label='Pedido' />,
        cell: ({ row }) => <span className='tabular-nums font-medium text-text'>#{row.original.orderId}</span>
      },
      {
        accessorKey: 'orderStatus',
        header: 'Situação',
        cell: ({ row }) => <StatusPill status={row.original.orderStatus} />
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <SortableColumnHeader column={column} label='Data' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-text-body'>
            {new Date(row.original.createdAt).toLocaleDateString('pt-BR')}
          </span>
        )
      },
      {
        accessorKey: 'customerName',
        header: ({ column }) => <SortableColumnHeader column={column} label='Cliente' />,
        cell: ({ row }) => <span className='font-medium text-text'>{row.original.customerName}</span>
      },
      {
        accessorKey: 'customerUF',
        header: 'UF',
        cell: ({ row }) => <span className='text-text-body'>{row.original.customerUF || '—'}</span>
      },
      {
        accessorKey: 'paymentCondition',
        header: 'Cond. pagamento',
        cell: ({ row }) => <span className='text-text-body'>{row.original.paymentCondition || '—'}</span>
      },
      {
        accessorKey: 'itemsCount',
        header: ({ column }) => <SortableColumnHeader column={column} label='Itens' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-text-body'>{formatNumber(row.original.itemsCount)}</span>
        )
      },
      {
        accessorKey: 'totalValue',
        header: ({ column }) => <SortableColumnHeader column={column} label='Valor total' />,
        cell: ({ row }) => (
          <span className='font-semibold tabular-nums text-text'>{formatCurrency(row.original.totalValue)}</span>
        )
      }
    ],
    []
  )

  if (data.length === 0) {
    return (
      <ReportEmptyState
        icon={ShoppingCart}
        title='Nenhum pedido neste período.'
        hint='Ajuste o período no botão de filtros para ampliar os meses ou os anos consultados.'
      />
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <KpiGrid
        // Four, not five: `KpiGrid` tops out at four columns, so a fifth card is orphaned on its
        // own row at every breakpoint. The item count rides along as the pedido count's hint,
        // which is where it belongs anyway — it qualifies that number.
        items={[
          {
            label: 'Total de pedidos',
            value: data.length,
            hint: `${formatNumber(totals.itemsCount)} itens no total`,
            type: 'order'
          },
          { label: 'Valor total', value: totals.totalValue, type: 'money' },
          { label: 'Valor pago', value: totals.amountPaid, type: 'money', icon: Wallet },
          { label: 'Descontos', value: totals.discount, type: 'warning', icon: TrendingDown }
        ]}
      />

      <ReportCard
        icon={BarChart3}
        title='Pedidos por situação'
        description='Quantidade de pedidos em cada etapa do funil, no período filtrado.'
      >
        <ChartContainer
          config={chartConfig}
          role='img'
          aria-label='Gráfico de barras: quantidade de pedidos por situação, no período filtrado'
          className={`${REPORT_CHART_BOX} ${REPORT_CHART_GRID_CLASS}`}
        >
          <BarChart accessibilityLayer data={chartData} margin={{ top: 16, right: 12, left: 12, bottom: 8 }}>
            <CartesianGrid vertical={false} />
            {/* The pt-BR status names are long ("Em orçamento", "Em aprovação") and `interval={0}`
                forces every one to render, so they collide head-on without the rotation. */}
            <XAxis
              dataKey='label'
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-30}
              textAnchor='end'
              height={72}
              className='text-xs'
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              className='text-xs'
              width={44}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={value => `${formatNumber(Number(value))} pedidos`} />}
            />
            <Bar dataKey='count' radius={[6, 6, 0, 0]}>
              {chartData.map(entry => (
                <Cell key={entry.status} fill={getOrderStatusBadgeStyle(entry.status as OrderStatus).color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </ReportCard>

      <ReportCard
        icon={Table2}
        title='Detalhamento'
        description={`${formatNumber(data.length)} ${data.length === 1 ? 'pedido' : 'pedidos'} no período filtrado.`}
      >
        <DataTable
          columns={columns}
          data={data}
          emptyMessage='Nenhum pedido encontrado com os filtros selecionados.'
        />
      </ReportCard>
    </div>
  )
}
