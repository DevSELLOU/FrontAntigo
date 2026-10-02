import { CompanyPriceTables } from '@/components/price-tables'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { GenericStatus } from '@/enums/generic-status.enum'
import { Company as CompanyType } from '@/interfaces/company.interface'
import type { DefaultSearchParams } from '@/interfaces/default-search-params.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import type { PriceTable as PriceTableType } from '@/interfaces/price-table.interface'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'
import { fetchData } from '@/utils/fetch-data'
import { getPageParams } from '@/utils/get-page-params.util'
import { Metadata } from 'next'

interface PageProps {
  searchParams: DefaultSearchParams
  params: {
    companyId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Tabelas de preço'
}

const statusLabels: Record<GenericStatus, string> = {
  [GenericStatus.Active]: 'Ativo',
  [GenericStatus.Inactive]: 'Inativo',
  [GenericStatus.Draft]: 'Rascunho'
}

const statusOptions = Object.values(GenericStatus).map(status => ({
  label: statusLabels[status],
  value: status
}))

export default async function PriceTablesPage({ searchParams, params }: PageProps) {
  const { companyId } = params
  const pageParams = getPageParams({ searchParams, includeDateFilters: false })

  const priceTablesUrl = `/company/${companyId}/price-tables?${pageParams}`
  const companyUrl = `/company/${companyId}`

  const [priceTablesResponse, companyResponse] = await Promise.all([
    fetchData<PaginatedResponse<PriceTableType>>(priceTablesUrl, 'Falha ao buscar tabelas de preço.'),
    fetchData<CompanyType>(companyUrl, 'Falha ao buscar empresa.')
  ])

  const { data: priceTables, metadata } = priceTablesResponse

  const filterFields: FilterField[] = [
    {
      key: 'name',
      label: 'Nome',
      type: 'text'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: statusOptions
    }
  ]

  return (
    <CompanyPriceTables
      priceTables={priceTables}
      metadata={metadata}
      filterFields={filterFields}
      companyId={companyId}
      companyColor={companyResponse?.customColor}
    />
  )
}
