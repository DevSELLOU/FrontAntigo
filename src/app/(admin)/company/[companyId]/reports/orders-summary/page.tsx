import { ReportToolbar } from '@/components/reports/report-toolbar'
import OrdersReportView, { OrdersReportRow } from '@/components/reports/orders-report-view'
import { serverFetch } from '@/utils/server-fetch.util'
import {
  allMonths,
  buildReportQueryString,
  generateYears,
  parseReportSearchParams,
  START_YEAR
} from '@/utils/reports/parse-report-search-params'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'
import { ShoppingCart } from 'lucide-react'

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
  title: METADATA_TITLE_PREFIX + 'Relatório de Pedidos'
}

export default async function OrdersSummaryReportPage({ params, searchParams }: PageProps) {
  const { selectedYears, selectedMonths } = parseReportSearchParams({
    years: searchParams.years,
    months: searchParams.months
  })

  const allYears = generateYears(START_YEAR)

  const fullUrl = `/reports/${params.companyId}/orders-summary?${buildReportQueryString(
    selectedYears,
    selectedMonths
  )}`

  const response = await serverFetch<{ data: OrdersReportRow[] }>(fullUrl, { method: 'GET' })

  const data: OrdersReportRow[] = response.data ?? []

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ReportToolbar
        title='Pedidos'
        description='Volume, valores e situação dos pedidos no período selecionado.'
        eyebrow='Volume e situação'
        icon={<ShoppingCart className='h-5 w-5' />}
        allYears={allYears}
        allMonths={allMonths}
        selectedYears={selectedYears}
        selectedMonths={selectedMonths}
      />

      <OrdersReportView data={data} />
    </div>
  )
}
