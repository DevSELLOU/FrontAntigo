'use client'

import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ColumnDef } from '@tanstack/react-table'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { DataTable } from '@/components/ui/data-table'
import { SortableColumnHeader } from '@/components/ui/sortable-column-header'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { KpiGrid } from '@/components/shared/kpi-grid'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  ReportCard,
  ReportEmptyState,
  REPORT_CHART_BOX_RANKING,
  REPORT_CHART_GRID_CLASS,
  truncateLabel
} from '@/components/reports/report-blocks'
import { formatCurrency } from '@/utils/format/format-currency'
import { clientFetch } from '@/utils/client-fetch.util'
import { cn } from '@/lib/utils'
import { BarChart3, Boxes, Eye, Loader2, Package, Table2, Trophy } from 'lucide-react'

export interface ProductsReportRow {
  productId: number
  productName: string
  brand?: string | null
  totalQuantitySold: number
  totalRevenue: number
  currentStock: number
  periodStart: string | null
  periodEnd: string | null
}

export interface ProductCustomer {
  customerId: number
  customerName: string
  customerDocument: string
  totalQuantity: number
  totalSpent: number
  lastPurchaseDate: string | null
}

interface ProductsReportViewProps {
  companyId: string
  data: ProductsReportRow[]
  selectedProducts: string[]
  selectedYears: string[]
  selectedMonths: string[]
}

type ChartMetric = 'quantity' | 'stock' | 'revenue'

/** Beyond this the Y axis stops being readable on a laptop screen. */
const CHART_LIMIT = 15

const METRICS: { value: ChartMetric; label: string }[] = [
  { value: 'quantity', label: 'Vendidos' },
  { value: 'stock', label: 'Estoque' },
  { value: 'revenue', label: 'Receita' }
]

const METRIC_LABELS: Record<ChartMetric, string> = {
  quantity: 'Unidades vendidas',
  stock: 'Estoque atual',
  revenue: 'Receita'
}

const formatNumber = (value: number): string => new Intl.NumberFormat('pt-BR').format(value)

const formatPeriod = (start: string | null, end: string | null): string => {
  if (!start || !end) return 'Sem período'
  if (start === end) return start
  return `${start} → ${end}`
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <StatusBadge variant='danger'>Sem estoque</StatusBadge>
  if (stock < 10) return <StatusBadge variant='warning'>Estoque baixo</StatusBadge>
  return <StatusBadge variant='success'>OK</StatusBadge>
}

export default function ProductsReportView({
  companyId,
  data,
  selectedProducts,
  selectedYears,
  selectedMonths
}: ProductsReportViewProps) {
  const [chartMetric, setChartMetric] = useState<ChartMetric>('quantity')

  const [selectedProduct, setSelectedProduct] = useState<ProductsReportRow | null>(null)
  const [customers, setCustomers] = useState<ProductCustomer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  // Tracked separately from `customers`: swallowing the failure into an empty array told the user
  // "ninguém comprou este produto", which is a business conclusion, not an error message.
  const [customersFailed, setCustomersFailed] = useState(false)

  const handleProductClick = async (product: ProductsReportRow) => {
    setSelectedProduct(product)
    setCustomers([])
    setCustomersFailed(false)
    setLoadingCustomers(true)

    try {
      const params = new URLSearchParams()
      selectedYears.forEach(year => params.append('years', year))
      selectedMonths.forEach(month => params.append('months', month))

      const response = await clientFetch<{ data: ProductCustomer[] }>(
        `/reports/${companyId}/products/${product.productId}/customers?${params.toString()}`,
        { method: 'GET' }
      )

      if (response && 'data' in response) {
        setCustomers(response.data)
      } else {
        setCustomersFailed(true)
      }
    } catch {
      setCustomersFailed(true)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const filteredData = useMemo(() => {
    if (selectedProducts.length === 0) return data
    const selectedSet = new Set(selectedProducts)
    return data.filter(row => selectedSet.has(String(row.productId)))
  }, [data, selectedProducts])

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, row) => {
          acc.totalQuantitySold += row.totalQuantitySold
          acc.totalRevenue += row.totalRevenue
          acc.currentStock += row.currentStock
          return acc
        },
        { totalQuantitySold: 0, totalRevenue: 0, currentStock: 0 }
      ),
    [filteredData]
  )

  const topProduct = useMemo(() => {
    if (filteredData.length === 0) return null
    return filteredData.reduce((best, row) => (row.totalQuantitySold > best.totalQuantitySold ? row : best))
  }, [filteredData])

  const productsWithStock = useMemo(
    () => filteredData.filter(row => row.currentStock > 0).length,
    [filteredData]
  )

  const periodLabel = useMemo(() => {
    if (filteredData.length === 0) return 'Sem período'
    return formatPeriod(filteredData[0].periodStart, filteredData[0].periodEnd)
  }, [filteredData])

  const chartData = useMemo(() => {
    const valueOf = (row: ProductsReportRow) =>
      chartMetric === 'quantity'
        ? row.totalQuantitySold
        : chartMetric === 'stock'
          ? row.currentStock
          : row.totalRevenue

    return [...filteredData]
      .sort((a, b) => valueOf(b) - valueOf(a))
      .slice(0, CHART_LIMIT)
      .map(row => ({
        productName: truncateLabel(row.productName),
        fullName: row.productName,
        value: valueOf(row)
      }))
  }, [filteredData, chartMetric])

  const chartConfig = useMemo<ChartConfig>(
    () => ({ value: { label: METRIC_LABELS[chartMetric], color: 'var(--action)' } }),
    [chartMetric]
  )

  const formatMetric = (value: number) =>
    chartMetric === 'revenue' ? formatCurrency(value) : formatNumber(value)

  const columns = useMemo<ColumnDef<ProductsReportRow>[]>(
    () => [
      {
        accessorKey: 'productName',
        header: ({ column }) => <SortableColumnHeader column={column} label='Produto' />,
        cell: ({ row }) => <span className='font-medium text-text'>{row.original.productName}</span>
      },
      {
        accessorKey: 'brand',
        header: 'Marca',
        cell: ({ row }) => <span className='text-text-body'>{row.original.brand || '—'}</span>
      },
      {
        accessorKey: 'totalQuantitySold',
        header: ({ column }) => <SortableColumnHeader column={column} label='Vendidos' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-text-body'>{formatNumber(row.original.totalQuantitySold)}</span>
        )
      },
      {
        accessorKey: 'totalRevenue',
        header: ({ column }) => <SortableColumnHeader column={column} label='Receita' />,
        cell: ({ row }) => (
          <span className='font-semibold tabular-nums text-text'>{formatCurrency(row.original.totalRevenue)}</span>
        )
      },
      {
        accessorKey: 'currentStock',
        header: ({ column }) => <SortableColumnHeader column={column} label='Estoque atual' />,
        cell: ({ row }) => {
          const stock = row.original.currentStock
          return (
            <div className='flex items-center gap-2'>
              <span
                className={cn(
                  'font-semibold tabular-nums',
                  stock <= 0
                    ? 'text-danger-foreground'
                    : stock < 10
                      ? 'text-warning-foreground'
                      : 'text-success-foreground'
                )}
              >
                {formatNumber(stock)}
              </span>
              <StockBadge stock={stock} />
            </div>
          )
        }
      },
      {
        // Affordance only: the whole row opens the drilldown (`onRowClick` on the table, which
        // also wires up the cursor, focus ring and Enter/Space), so a second click target here
        // would just fire the same fetch twice.
        id: 'details',
        header: '',
        cell: () => (
          <div className='flex justify-end text-text-muted'>
            <Eye aria-hidden='true' className='h-4 w-4' />
          </div>
        )
      }
    ],
    []
  )

  const customerColumns = useMemo<ColumnDef<ProductCustomer>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: ({ column }) => <SortableColumnHeader column={column} label='Cliente' />,
        cell: ({ row }) => <span className='font-medium text-text'>{row.original.customerName}</span>
      },
      {
        accessorKey: 'customerDocument',
        header: 'Documento',
        cell: ({ row }) => <span className='text-text-muted'>{row.original.customerDocument}</span>
      },
      {
        accessorKey: 'totalQuantity',
        header: ({ column }) => <SortableColumnHeader column={column} label='Comprou (unid.)' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-text-body'>{formatNumber(row.original.totalQuantity)}</span>
        )
      },
      {
        accessorKey: 'totalSpent',
        header: ({ column }) => <SortableColumnHeader column={column} label='Total gasto' />,
        cell: ({ row }) => (
          <span className='font-semibold tabular-nums text-text'>{formatCurrency(row.original.totalSpent)}</span>
        )
      },
      {
        accessorKey: 'lastPurchaseDate',
        header: ({ column }) => <SortableColumnHeader column={column} label='Última compra' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-text-muted'>
            {row.original.lastPurchaseDate
              ? new Date(row.original.lastPurchaseDate).toLocaleDateString('pt-BR')
              : '—'}
          </span>
        )
      }
    ],
    []
  )

  if (data.length === 0) {
    return (
      <ReportEmptyState
        icon={Boxes}
        title='Nenhum produto vendido neste período.'
        hint='Ajuste o período no botão de filtros para ampliar os meses ou os anos consultados.'
      />
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <KpiGrid
        items={[
          {
            label: 'Produto mais vendido',
            value: topProduct?.productName ?? '—',
            hint: topProduct ? `${formatNumber(topProduct.totalQuantitySold)} unidades` : 'Sem vendas no período',
            type: 'money',
            icon: Trophy
          },
          {
            label: 'Unidades vendidas',
            value: totals.totalQuantitySold,
            hint: `Período: ${periodLabel}`,
            type: 'order',
            icon: Package
          },
          { label: 'Receita total', value: totals.totalRevenue, type: 'money' },
          {
            label: 'Produtos com estoque',
            value: `${formatNumber(productsWithStock)} / ${formatNumber(filteredData.length)}`,
            hint: `${formatNumber(totals.currentStock)} unidades totais`,
            type: 'order',
            icon: Boxes
          }
        ]}
      />

      <ReportCard
        icon={BarChart3}
        title={`Top ${Math.min(CHART_LIMIT, filteredData.length)} produtos`}
        description='Ranking dos produtos pelo indicador selecionado.'
        actions={
          // `p-[3px]` / `rounded-[9px]` are copied verbatim from the view selector in
          // `shared/listing-page-header.tsx` on purpose: it is the same control in a different
          // place, and rounding them to the scale would make the two visibly differ.
          //
          // The container is NOT `bg-brand-050 border-brand-100`, which is what that selector
          // uses: those two tokens are declared only on `:root` and never in `.dark`, so in the
          // dark theme the group stays mint while its labels go light grey — around 1.5:1. The
          // glass pair is visually equivalent in light mode and actually flips. (The listing
          // header still has the original bug; fixing it there means adding the dark values in
          // `globals.css`, which is shared ground.)
          <div
            role='group'
            aria-label='Indicador do gráfico'
            className='flex items-center gap-0.5 rounded-md border border-[var(--glass-border)] bg-[var(--glass-icon-bg)] p-[3px]'
          >
            {METRICS.map(metric => {
              const isActive = chartMetric === metric.value
              return (
                <button
                  key={metric.value}
                  type='button'
                  aria-pressed={isActive}
                  onClick={() => setChartMetric(metric.value)}
                  className={cn(
                    // 44px on touch widths (DESIGN §11.3), 36px from `sm` up where the pointer
                    // is a mouse and the denser control reads better.
                    'h-11 rounded-[9px] px-3 text-sm font-medium text-text-body transition-colors sm:h-9',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                    isActive ? 'bg-surface text-primary shadow-card' : 'hover:bg-surface'
                  )}
                >
                  {metric.label}
                </button>
              )
            })}
          </div>
        }
      >
        {chartData.length === 0 ? (
          // DESIGN §4: "Sem série significa estado vazio dentro do card, nunca eixo em branco."
          <div className='py-10 text-center'>
            <p className='text-body font-semibold text-text'>Nenhum produto no filtro selecionado.</p>
            <p className='text-caption mt-1 text-text-muted'>
              Remova algum produto do filtro ou amplie o período.
            </p>
          </div>
        ) : (
        <ChartContainer
          config={chartConfig}
          role='img'
          aria-label={`Gráfico de barras: ranking de produtos por ${METRIC_LABELS[chartMetric].toLowerCase()}`}
          className={`${REPORT_CHART_BOX_RANKING} ${REPORT_CHART_GRID_CLASS}`}
        >
          <BarChart accessibilityLayer data={chartData} layout='vertical' margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid horizontal={false} />
            <XAxis
              type='number'
              tickLine={false}
              axisLine={false}
              tickFormatter={formatMetric}
              className='text-xs'
            />
            <YAxis
              dataKey='productName'
              type='category'
              tickLine={false}
              axisLine={false}
              // 180px of gutter left ~100px of plot on a 360px screen; 140 plus the shared
              // 22-char truncation keeps the bars readable without clipping the names.
              width={140}
              className='text-xs'
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName ?? label}
                  formatter={value => (
                    <span className='flex w-full justify-between gap-3'>
                      <span className='text-text-muted'>{METRIC_LABELS[chartMetric]}</span>
                      <span className='font-mono font-medium tabular-nums text-text'>
                        {formatMetric(Number(value))}
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Bar dataKey='value' fill='var(--color-value)' radius={[0, 6, 6, 0]} />
          </BarChart>
        </ChartContainer>
        )}
      </ReportCard>

      <ReportCard
        icon={Table2}
        title='Detalhamento'
        description='Selecione um produto para ver quem comprou no período.'
      >
        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={handleProductClick}
          emptyMessage='Nenhum produto encontrado com os filtros selecionados.'
        />
      </ReportCard>

      <Dialog
        open={!!selectedProduct}
        onOpenChange={open => {
          if (!open) setSelectedProduct(null)
        }}
      >
        <DialogContent className='flex max-h-[85vh] flex-col overflow-hidden xl:max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Clientes — {selectedProduct?.productName}</DialogTitle>
          </DialogHeader>

          {loadingCustomers ? (
            <div className='flex items-center justify-center gap-2 py-12 text-text-muted'>
              <Loader2 className='h-5 w-5 animate-spin' />
              <span className='text-body'>Carregando clientes…</span>
            </div>
          ) : customersFailed ? (
            <div className='py-12 text-center'>
              <p className='text-body font-semibold text-text'>Não foi possível carregar os clientes.</p>
              <p className='text-caption mt-1 text-text-muted'>
                A consulta não respondeu. Feche e abra de novo para tentar outra vez.
              </p>
            </div>
          ) : customers.length === 0 ? (
            <div className='py-12 text-center'>
              <p className='text-body font-semibold text-text'>Nenhum cliente comprou este produto no período.</p>
              <p className='text-caption mt-1 text-text-muted'>Amplie o período no filtro para buscar mais longe.</p>
            </div>
          ) : (
            <div className='min-h-0 flex-1'>
              <DataTable columns={customerColumns} data={customers} maxHeightClassName='max-h-[60vh]' />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
