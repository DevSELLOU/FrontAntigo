import { KpiGrid } from '@/components/shared/kpi-grid'
import { DataTable } from '@/components/shared/data-table'
import type { PedidosData } from '@/interfaces/dashboard/dashboard-v2.types'

interface PedidosPanelProps {
  data: PedidosData
}

export function PedidosPanel({ data }: PedidosPanelProps) {
  const { kpis, tables } = data

  return (
    <div className='space-y-6'>
      <KpiGrid items={[
        { label: 'Pedidos', value: kpis.invoices, type: 'order' },
        { label: 'Pedidos Liberados p/ Faturamento', value: kpis.approvedOrders, type: 'order' },
        { label: 'Pedidos em Carteira', value: kpis.inApprovalOrders, type: 'order' },
        { label: 'Pedidos Bloqueados', value: kpis.blockedOrders, type: 'order' },
        { label: 'Pedidos Cancelados', value: kpis.canceledOrders, type: 'danger' },
        { label: 'Valor de Orçamentos', value: kpis.onBudgetOrders, type: 'order' },
      ]} />

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        <DataTable
          title='1. Pedidos por Região'
          columns={[{ key: 'region', label: 'Região' }, { key: 'revenue', label: 'Valor de pedidos', format: 'currency' }]}
          data={tables.pedidosByRegion}
        />
        <DataTable
          title='2. Top Produtos Vendidos no Filtro'
          columns={[{ key: 'name', label: 'Produto' }, { key: 'revenue', label: 'Valor vendido', format: 'currency' }]}
          data={tables.topProducts}
        />
        <DataTable
          title='3. Ranking de Clientes por Pedidos'
          columns={[
            { key: 'name', label: 'Cliente' },
            { key: 'revenue', label: 'Valor', format: 'currency' },
            { key: 'orders', label: 'Pedidos', format: 'number' },
          ]}
          data={tables.rankingClientes}
        />
      </div>
    </div>
  )
}
