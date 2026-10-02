import { ReportToolbar } from '@/components/reports/report-toolbar'
import { AdditionalFilterConfig } from '@/components/reports/report-filter-drawer'
import SalesReportView, { SalesByVendorRow } from '@/components/reports/sales-report-view'
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
import { TrendingUp } from 'lucide-react'

interface PageProps {
  params: {
    companyId: string
  }
  searchParams: {
    years?: string | string[]
    months?: string | string[]
    vendors?: string | string[]
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Relatório de Vendas'
}

export default async function SalesReportPage({ params, searchParams }: PageProps) {
  const {
    selectedYears,
    selectedMonths,
    selectedThird: selectedVendors
  } = parseReportSearchParams({
    years: searchParams.years,
    months: searchParams.months,
    third: searchParams.vendors
  })

  const allYears = generateYears(START_YEAR)

  const fullUrl = `/reports/${params.companyId}/sales?${buildReportQueryString(selectedYears, selectedMonths)}`

  const response = await serverFetch<{ data: SalesByVendorRow[] }>(fullUrl, { method: 'GET' })

  const data: SalesByVendorRow[] = response.data ?? []

  const vendorFilter: AdditionalFilterConfig = {
    label: 'Vendedor(es)',
    paramName: 'vendors',
    options: Array.from(new Map(data.map(row => [String(row.vendorId), row.vendorName])).entries()).map(
      ([id, label]) => ({ id, label })
    )
  }

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ReportToolbar
        title='Vendas'
        description='Receita, pedidos e itens por vendedor no período selecionado.'
        eyebrow='Receita por vendedor'
        icon={<TrendingUp className='h-5 w-5' />}
        allYears={allYears}
        allMonths={allMonths}
        selectedYears={selectedYears}
        selectedMonths={selectedMonths}
        additionalFilter={vendorFilter}
        selectedThird={selectedVendors}
      />

      <SalesReportView data={data} selectedVendors={selectedVendors} />
    </div>
  )
}
