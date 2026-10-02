import { ReportToolbar } from '@/components/reports/report-toolbar'
import { AdditionalFilterConfig } from '@/components/reports/report-filter-drawer'
import ProductsReportView, { ProductsReportRow } from '@/components/reports/products-report-view'
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
import { Boxes } from 'lucide-react'

interface PageProps {
  params: {
    companyId: string
  }
  searchParams: {
    years?: string | string[]
    months?: string | string[]
    products?: string | string[]
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Relatório de Produtos'
}

export default async function ProductsReportPage({ params, searchParams }: PageProps) {
  const {
    selectedYears,
    selectedMonths,
    selectedThird: selectedProducts
  } = parseReportSearchParams({
    years: searchParams.years,
    months: searchParams.months,
    third: searchParams.products
  })

  const allYears = generateYears(START_YEAR)

  // Deliberately NOT narrowing the request by `selectedProducts`, the way this page used to.
  // The filter's own option list is derived from this response, so filtering server-side made
  // the list collapse to the single product already chosen — a one-way door: you could not add
  // a second product without clearing first. `ProductsReportView` already narrows client-side,
  // which is also what the Sales report does behind an identical-looking control.
  const fullUrl = `/reports/${params.companyId}/products?${buildReportQueryString(
    selectedYears,
    selectedMonths
  )}`

  const response = await serverFetch<{ data: ProductsReportRow[] }>(fullUrl, { method: 'GET' })

  const data: ProductsReportRow[] = response.data ?? []

  const productFilter: AdditionalFilterConfig = {
    label: 'Produto(s)',
    paramName: 'products',
    options: Array.from(new Map(data.map(row => [String(row.productId), row.productName])).entries()).map(
      ([id, label]) => ({ id, label })
    )
  }

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ReportToolbar
        title='Produtos'
        description='Giro, receita e estoque dos produtos no período selecionado.'
        eyebrow='Giro e estoque'
        icon={<Boxes className='h-5 w-5' />}
        allYears={allYears}
        allMonths={allMonths}
        selectedYears={selectedYears}
        selectedMonths={selectedMonths}
        additionalFilter={productFilter}
        selectedThird={selectedProducts}
      />

      <ProductsReportView
        companyId={params.companyId}
        data={data}
        selectedProducts={selectedProducts}
        selectedYears={selectedYears}
        selectedMonths={selectedMonths}
      />
    </div>
  )
}
