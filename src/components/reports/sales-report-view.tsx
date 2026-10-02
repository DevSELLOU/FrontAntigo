'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ColumnDef } from '@tanstack/react-table'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { DataTable } from '@/components/ui/data-table'
import { SortableColumnHeader } from '@/components/ui/sortable-column-header'
import { KpiGrid } from '@/components/shared/kpi-grid'
import {
  brandSeriesRamp,
  ReportCard,
  ReportEmptyState,
  REPORT_CHART_BOX_WITH_LEGEND,
  REPORT_CHART_GRID_CLASS,
  truncateLabel
} from '@/components/reports/report-blocks'
import { formatCurrency } from '@/utils/format/format-currency'
import { BarChart3, Table2, Trophy, Users } from 'lucide-react'

export interface SalesByVendorRow {
  vendorId: number
  vendorName: string
  year: number
  month: number
  orderCount: number
  totalValue: number
  totalItems: number
}

interface SalesReportViewProps {
  data: SalesByVendorRow[]
  selectedVendors: string[]
}

const monthNamesShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const formatPeriod = (year: number, month: number): string =>
  `${monthNamesShort[month - 1] ?? String(month).padStart(2, '0')}/${year}`

const getPeriodKey = (year: number, month: number): string => `${year}-${String(month).padStart(2, '0')}`

const formatPeriodKey = (key: string): string => {
  const [year, month] = key.split('-').map(Number)
  return formatPeriod(year, month)
}

const formatNumber = (value: number): string => new Intl.NumberFormat('pt-BR').format(value)

/** Beyond this the X axis stops being readable; the tail is folded into a single "Outros" bar. */
const VENDOR_LIMIT_FOR_CHART = 10

export default function SalesReportView({ data, selectedVendors }: SalesReportViewProps) {
  const filteredData = useMemo(() => {
    if (selectedVendors.length === 0) return data
    const selectedSet = new Set(selectedVendors)
    return data.filter(row => selectedSet.has(String(row.vendorId)))
  }, [data, selectedVendors])

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, row) => {
          acc.orderCount += row.orderCount
          acc.totalValue += row.totalValue
          acc.totalItems += row.totalItems
          return acc
        },
        { orderCount: 0, totalValue: 0, totalItems: 0 }
      ),
    [filteredData]
  )

  const uniqueVendorsCount = useMemo(
    () => new Set(filteredData.map(row => row.vendorId)).size,
    [filteredData]
  )

  const topVendor = useMemo(() => {
    const byVendor = new Map<number, { name: string; value: number }>()
    for (const row of filteredData) {
      const existing = byVendor.get(row.vendorId)
      if (existing) {
        existing.value += row.totalValue
      } else {
        byVendor.set(row.vendorId, { name: row.vendorName, value: row.totalValue })
      }
    }

    let best: { name: string; value: number } | null = null
    for (const entry of byVendor.values()) {
      if (!best || entry.value > best.value) best = entry
    }
    return best
  }, [filteredData])

  const allPeriods = useMemo(
    () => Array.from(new Set(filteredData.map(row => getPeriodKey(row.year, row.month)))).sort(),
    [filteredData]
  )

  const chartData = useMemo(() => {
    if (filteredData.length === 0 || allPeriods.length === 0) return []

    const byVendor = new Map<number, { vendorName: string; byPeriod: Map<string, number> }>()
    for (const row of filteredData) {
      const periodKey = getPeriodKey(row.year, row.month)
      let entry = byVendor.get(row.vendorId)
      if (!entry) {
        entry = { vendorName: row.vendorName, byPeriod: new Map() }
        byVendor.set(row.vendorId, entry)
      }
      entry.byPeriod.set(periodKey, (entry.byPeriod.get(periodKey) ?? 0) + row.totalValue)
    }

    const sorted = Array.from(byVendor.values())
      .map(entry => ({
        name: entry.vendorName,
        total: Array.from(entry.byPeriod.values()).reduce((a, b) => a + b, 0),
        byPeriod: entry.byPeriod
      }))
      .sort((a, b) => b.total - a.total)

    const toRow = (name: string, byPeriod: Map<string, number>, total: number) => {
      const row: Record<string, string | number> = { vendorName: name }
      for (const period of allPeriods) row[period] = byPeriod.get(period) ?? 0
      row.total = total
      return row
    }

    if (sorted.length <= VENDOR_LIMIT_FOR_CHART) {
      return sorted.map(entry => toRow(entry.name, entry.byPeriod, entry.total))
    }

    const top = sorted.slice(0, VENDOR_LIMIT_FOR_CHART - 1)
    const rest = sorted.slice(VENDOR_LIMIT_FOR_CHART - 1)

    const outrosByPeriod = new Map<string, number>()
    for (const entry of rest) {
      for (const [period, value] of entry.byPeriod) {
        outrosByPeriod.set(period, (outrosByPeriod.get(period) ?? 0) + value)
      }
    }
    const outrosTotal = Array.from(outrosByPeriod.values()).reduce((a, b) => a + b, 0)

    return [
      ...top.map(entry => toRow(entry.name, entry.byPeriod, entry.total)),
      toRow(`Outros (${rest.length})`, outrosByPeriod, outrosTotal)
    ]
  }, [filteredData, allPeriods])

  // One series per period, colored along the brand ramp — periods are ordered data, so the
  // sequential ramp says "later" where the old ten-color rainbow said nothing.
  const chartConfig = useMemo<ChartConfig>(() => {
    const ramp = brandSeriesRamp(allPeriods.length)
    return Object.fromEntries(
      allPeriods.map((period, index) => [period, { label: formatPeriodKey(period), color: ramp[index] }])
    )
  }, [allPeriods])

  const columns = useMemo<ColumnDef<SalesByVendorRow>[]>(
    () => [
      {
        accessorKey: 'vendorName',
        header: ({ column }) => <SortableColumnHeader column={column} label='Vendedor' />,
        cell: ({ row }) => <span className='font-medium text-text'>{row.original.vendorName}</span>
      },
      {
        // `accessorFn` on purpose: the old column keyed off a `period` field the row never had,
        // so its sort button reordered nothing.
        id: 'period',
        accessorFn: row => getPeriodKey(row.year, row.month),
        header: ({ column }) => <SortableColumnHeader column={column} label='Período' />,
        cell: ({ row }) => (
          <span className='inline-flex items-center rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-text-body'>
            {formatPeriod(row.original.year, row.original.month)}
          </span>
        )
      },
      {
        accessorKey: 'orderCount',
        header: ({ column }) => <SortableColumnHeader column={column} label='Pedidos' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-text-body'>{formatNumber(row.original.orderCount)}</span>
        )
      },
      {
        accessorKey: 'totalItems',
        header: ({ column }) => <SortableColumnHeader column={column} label='Itens' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-text-body'>{formatNumber(row.original.totalItems)}</span>
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
        icon={BarChart3}
        title='Nenhuma venda neste período.'
        hint='Ajuste o período no botão de filtros para ampliar os meses ou os anos consultados.'
      />
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <KpiGrid
        // Four, not five — see the note in the Orders report: a fifth card is orphaned on its own
        // row at every breakpoint, so the item count rides along as a hint.
        items={[
          {
            label: 'Total de pedidos',
            value: totals.orderCount,
            hint: `${formatNumber(totals.totalItems)} itens vendidos`,
            type: 'order'
          },
          { label: 'Receita total', value: totals.totalValue, type: 'money' },
          { label: 'Vendedores ativos', value: uniqueVendorsCount, type: 'people', icon: Users },
          {
            label: 'Vendedor destaque',
            value: topVendor?.name ?? '—',
            hint: topVendor ? formatCurrency(topVendor.value) : 'Sem vendas no período',
            type: 'money',
            icon: Trophy
          }
        ]}
      />

      <ReportCard
        icon={BarChart3}
        title='Vendas por vendedor'
        description='Receita de cada vendedor, empilhada por mês do período filtrado.'
      >
        {chartData.length === 0 ? (
          <div className='py-10 text-center'>
            <p className='text-body font-semibold text-text'>Nenhuma venda para os vendedores selecionados.</p>
            <p className='text-caption mt-1 text-text-muted'>
              Remova algum vendedor do filtro ou amplie o período.
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            role='img'
            aria-label='Gráfico de barras empilhadas: receita por vendedor, uma faixa por mês do período filtrado'
            className={`${REPORT_CHART_BOX_WITH_LEGEND} ${REPORT_CHART_GRID_CLASS}`}
          >
            <BarChart accessibilityLayer data={chartData} margin={{ top: 16, right: 12, left: 12, bottom: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='vendorName'
                tickLine={false}
                axisLine={false}
                angle={-30}
                textAnchor='end'
                height={80}
                interval={0}
                // Products truncates its labels and Sales did not — the same problem needs the
                // same answer, or one chart's axis silently overflows where the other's doesn't.
                tickFormatter={(name: string) => truncateLabel(name)}
                className='text-xs'
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={84}
                tickFormatter={(value: number) => formatCurrency(value)}
                className='text-xs'
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span className='flex w-full justify-between gap-3'>
                        <span className='text-text-muted'>{formatPeriodKey(String(name))}</span>
                        <span className='font-mono font-medium tabular-nums text-text'>
                          {formatCurrency(Number(value))}
                        </span>
                      </span>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent className='flex-wrap gap-x-4 gap-y-1' />} />
              {allPeriods.map((period, index) => (
                <Bar
                  key={period}
                  dataKey={period}
                  stackId='periods'
                  fill={`var(--color-${period})`}
                  radius={index === allPeriods.length - 1 ? [6, 6, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </ReportCard>

      <ReportCard
        icon={Table2}
        title='Detalhamento'
        description={`${formatNumber(filteredData.length)} ${
          filteredData.length === 1 ? 'linha' : 'linhas'
        } de vendedor por período.`}
      >
        <DataTable
          columns={columns}
          data={filteredData}
          emptyMessage='Nenhuma venda encontrada com os filtros selecionados.'
        />
      </ReportCard>
    </div>
  )
}
