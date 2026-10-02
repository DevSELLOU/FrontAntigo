import { DataTable } from '@/components/shared/data-table'
import { KpiGrid } from '@/components/shared/kpi-grid'
import type { CoberturaData } from '@/interfaces/dashboard/dashboard-v2.types'
import {
  MapPin,
  MapPinned
} from 'lucide-react'

interface CoberturaPanelProps {
  data: CoberturaData
}

export function CoberturaPanel({
  data
}: CoberturaPanelProps) {
  const { kpis, tables } = data

  return (
    <div className='min-w-0 space-y-6'>
      <KpiGrid
        items={[
          {
            label: 'Faturamento',
            value: kpis.revenue,
            type: 'money'
          },
          {
            label: 'Cobertura',
            value: kpis.coveragePct,
            type: 'percent',
            icon: MapPinned
          },
          {
            label: 'Municípios com Venda',
            value: kpis.citiesWithSales,
            type: 'warning',
            icon: MapPin
          },
          {
            label: 'Municípios sem Venda',
            value: kpis.citiesWithoutSales,
            type: 'danger',
            icon: MapPin
          }
        ]}
      />

      <div className='grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2'>
        <DataTable
          title='Cobertura por Região'
          columns={[
            {
              key: 'region',
              label: 'Região'
            },
            {
              key: 'comVenda',
              label: 'C/ Venda',
              format: 'number'
            },
            {
              key: 'receita',
              label: 'Receita',
              format: 'currency'
            }
          ]}
          data={tables.byRegion}
        />

        <DataTable
          title='Cobertura por Representante'
          columns={[
            {
              key: 'seller',
              label: 'Representante'
            },
            {
              key: 'cities',
              label: 'Cidades',
              format: 'number'
            },
            {
              key: 'revenue',
              label: 'Faturamento',
              format: 'currency'
            }
          ]}
          data={tables.bySeller}
        />
      </div>

      <div className='grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2'>
        <DataTable
          title='Cobertura por UF'
          columns={[
            {
              key: 'state',
              label: 'UF'
            },
            {
              key: 'comVenda',
              label: 'C/ Venda',
              format: 'number'
            },
            {
              key: 'semVenda',
              label: 'S/ Venda',
              format: 'number'
            },
            {
              key: 'revenue',
              label: 'Faturamento',
              format: 'currency'
            }
          ]}
          data={tables.byState}
        />

        <DataTable
          title='Cobertura por Colaborador'
          columns={[
            {
              key: 'seller',
              label: 'Colaborador'
            },
            {
              key: 'cities',
              label: 'Cidades',
              format: 'number'
            },
            {
              key: 'revenue',
              label: 'Faturamento',
              format: 'currency'
            }
          ]}
          data={tables.byCollaborator}
        />
      </div>

      <div className='grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2'>
        <DataTable
          title='Cidades com Venda'
          columns={[
            {
              key: 'city',
              label: 'Cidade'
            },
            {
              key: 'state',
              label: 'UF'
            },
            {
              key: 'region',
              label: 'Região'
            },
            {
              key: 'revenue',
              label: 'Faturamento',
              format: 'currency'
            }
          ]}
          data={
            tables.citiesWithSalesList
          }
        />

        <DataTable
          title='Cidades sem Venda'
          columns={[
            {
              key: 'city',
              label: 'Cidade'
            },
            {
              key: 'state',
              label: 'UF'
            },
            {
              key: 'region',
              label: 'Região'
            },
            {
              key: 'status',
              label: 'Status'
            }
          ]}
          data={
            tables.citiesWithoutSalesList
          }
        />
      </div>
    </div>
  )
}
