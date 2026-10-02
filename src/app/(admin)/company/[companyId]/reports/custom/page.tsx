import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { Table2 } from 'lucide-react'

import { ReportToolbar } from '@/components/reports/report-toolbar'
import { ReportCard, ReportLoadingState } from '@/components/reports/report-blocks'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { getOrderStatusText } from '@/utils/get-order-status-text.util'
import { serverFetch } from '@/utils/server-fetch.util'
import {
  allMonths,
  buildReportQueryString,
  generateYears,
  parseReportSearchParams,
  START_YEAR
} from '@/utils/reports/parse-report-search-params'
import type { OrderStatus } from '@/enums/order-status.enum'

interface PageProps {
  params: {
    companyId: string
  }
  searchParams: {
    years?: string | string[]
    months?: string | string[]
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Relatório Personalizável'
}

const DynamicPivotTableClient = dynamic(
  () => import('@/components/reports/pivot-table-client').then(mod => mod.PivotTableClient),
  {
    ssr: false,
    loading: () => <ReportLoadingState label='Montando a tabela dinâmica…' />
  }
)

const HEADERS = [
  'ID Pedido',
  'Status Pedido',
  'Valor Pedido',
  'Data Pedido',
  'Nome Cliente',
  'Documento Cliente',
  'Segmento Cliente',
  'UF Cliente',
  'Grupo Cliente',
  'Condição Pagamento',
  'Valor Pago',
  'Desconto Total (Pedido)',
  'Qtde Item',
  'Desconto Item',
  'Valor Total Item',
  'ID Produto',
  'Nome Produto',
  'Preço Produto (Unit)',
  'Marca Produto',
  'Unidade Produto'
]

/** Flattens orders into the sheet shape `react-pivottable` expects: header row, then values. */
const flattenOrderData = (orders: any[]): unknown[][] => {
  if (!orders || orders.length === 0) return [HEADERS]

  const dataRows = orders.flatMap((order: any) => {
    const orderDetails = {
      'ID Pedido': order.id,
      'Status Pedido': getOrderStatusText(order.status as OrderStatus),
      'Valor Pedido': parseFloat(order.totalValue),
      'Data Pedido': order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : 'N/A',
      'Nome Cliente': order.customer?.fantasyName || order.customer?.corporateName || 'N/A',
      'Documento Cliente': order.customer?.document,
      'Segmento Cliente': order.customer?.segment,
      'UF Cliente': order.customer?.UF,
      'Grupo Cliente': order.customer?.customerGroupCode,
      'Condição Pagamento': order.paymentCondition?.name,
      'Valor Pago': parseFloat(order.amountPaid),
      'Desconto Total (Pedido)': parseFloat(order.discount)
    }

    return (order.orderItems || []).map((item: any) => {
      const unitPrice = parseFloat(item.product?.price || '0.00')
      const quantity = item.quantity
      const itemDiscount = parseFloat(item.discount || '0.00')

      return {
        ...orderDetails,
        'Qtde Item': quantity,
        'Desconto Item': itemDiscount,
        'Valor Total Item': unitPrice * quantity - itemDiscount,
        'ID Produto': item.productId,
        'Nome Produto': item.product?.name,
        'Preço Produto (Unit)': unitPrice,
        'Marca Produto': item.product?.brand,
        'Unidade Produto': item.product?.unitOfMeasure
      }
    })
  })

  return [HEADERS, ...dataRows.map((row: Record<string, unknown>) => HEADERS.map(header => row[header]))]
}

export default async function CustomReportPage({ params, searchParams }: PageProps) {
  const { selectedYears, selectedMonths } = parseReportSearchParams({
    years: searchParams.years,
    months: searchParams.months
  })

  const allYears = generateYears(START_YEAR)

  const query = buildReportQueryString(selectedYears, selectedMonths)
  const url = `/reports/${params.companyId}/orders`
  const fullUrl = query ? `${url}?${query}` : url

  const response = await serverFetch<any>(fullUrl, { method: 'GET' })

  const reportData = flattenOrderData(response.data)

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ReportToolbar
        title='Relatório personalizável'
        description='Monte o cruzamento que precisar: arraste os campos para linhas, colunas e valores.'
        eyebrow='Cruzamento livre'
        icon={<Table2 className='h-5 w-5' />}
        allYears={allYears}
        allMonths={allMonths}
        selectedYears={selectedYears}
        selectedMonths={selectedMonths}
      />

      <ReportCard
        icon={Table2}
        title='Tabela dinâmica'
        description={`${reportData.length - 1} ${
          reportData.length - 1 === 1 ? 'linha' : 'linhas'
        } de item de pedido no período filtrado.`}
      >
        <DynamicPivotTableClient data={reportData} />
      </ReportCard>
    </div>
  )
}
