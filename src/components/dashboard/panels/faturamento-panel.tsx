import { KpiGrid } from '@/components/shared/kpi-grid'
import { DataTable } from '@/components/shared/data-table'
import type { FaturamentoData } from '@/interfaces/dashboard/dashboard-v2.types'

interface FaturamentoPanelProps {
  data: FaturamentoData
}

export function FaturamentoPanel({ data }: FaturamentoPanelProps) {
  const { kpis, tables } = data

  return (
    <div className='space-y-6'>
      <KpiGrid items={[
        { label: 'Faturamento', value: kpis.revenue, type: 'money' },
        { label: 'Devoluções', value: kpis.returns, type: 'danger' },
        { label: 'Ticket Médio', value: kpis.averageTicket, type: 'money' },
        { label: 'Positivação', value: kpis.totalCustomers, type: 'people' },
        { label: 'Mix Médio de Itens', value: kpis.averageMixItems, type: 'warning' },
      ]} />

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        <DataTable
          title='1. Faturamento por Região'
          columns={[{ key: 'region', label: 'Região' }, { key: 'revenue', label: 'Faturamento', format: 'currency' }]}
          data={tables.revenueByRegion}
        />
        <DataTable
          title='Faturamento por Mês'
          columns={[{ key: 'month', label: 'Mês' }, { key: 'revenue', label: 'Faturamento', format: 'currency' }]}
          data={tables.revenueByMonth}
        />
        <DataTable
          title='Faturamento por Estado'
          columns={[{ key: 'state', label: 'Estado' }, { key: 'revenue', label: 'Faturamento', format: 'currency' }]}
          data={tables.revenueByState}
        />
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
        <DataTable
          title='2. Top Produtos Vendidos no Filtro'
          columns={[{ key: 'name', label: 'Produto' }, { key: 'revenue', label: 'Faturamento', format: 'currency' }]}
          data={tables.topProducts}
        />
        <DataTable
          title='3. Ranking de Clientes por Faturamento'
          columns={[
            { key: 'name', label: 'Cliente' },
            { key: 'revenue', label: 'Faturamento', format: 'currency' },
            { key: 'orders', label: 'Pedidos', format: 'number' },
          ]}
          data={tables.rankingClientes}
        />
      </div>
    </div>
  )
}
