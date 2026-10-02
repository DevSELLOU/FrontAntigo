import { KpiGrid } from '@/components/shared/kpi-grid'
import { DataTable } from '@/components/shared/data-table'
import type { DinamicoData } from '@/interfaces/dashboard/dashboard-v2.types'

interface DinamicoPanelProps {
  data: DinamicoData
}

export function DinamicoPanel({ data }: DinamicoPanelProps) {
  const { kpis, tables } = data

  const repColumns = [
    { key: 'name', label: 'Representante' },
    { key: 'fat', label: 'Fat.', format: 'currency' as const },
    { key: 'pedidosR$', label: 'Pedidos R$', format: 'currency' as const },
  ]

  const colabColumns = [
    { key: 'name', label: 'Colaborador' },
    { key: 'fat', label: 'Fat.', format: 'currency' as const },
    { key: 'pedidosR$', label: 'Pedidos R$', format: 'currency' as const },
  ]

  return (
    <div className='space-y-6'>
      <KpiGrid items={[
        { label: 'Faturamento do Mês', value: kpis.revenue, type: 'money' },
        { label: 'Devolução', value: kpis.returns, type: 'danger' },
        { label: 'Pedidos', value: kpis.invoices, type: 'order' },
        { label: 'Ticket Médio', value: kpis.averageTicket, type: 'money' },
        { label: 'Positivação', value: kpis.totalCustomers, type: 'people' },
        { label: 'Clientes Ativos', value: kpis.activeCustomers, type: 'people' },
        { label: 'Clientes Inativos +90d', value: kpis.inactiveCustomers, type: 'danger' },
        { label: 'Cidades Atendidas', value: kpis.citiesAttended, type: 'warning' },
        { label: 'Quantidade de Pedidos', value: kpis.totalOrders, type: 'order' },
      ]} />

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
        <DataTable title='1. Resultado Geral por Representante' columns={repColumns} data={tables.resultsByRepresentative} />
        <DataTable title='2. Resultado Geral por Colaborador' columns={colabColumns} data={tables.resultsByCollaborator} />
      </div>
    </div>
  )
}
