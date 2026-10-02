import { DataTable } from '@/components/shared/data-table'
import { KpiGrid } from '@/components/shared/kpi-grid'
import type { GestaoData } from '@/interfaces/dashboard/dashboard-v2.types'

interface GestaoPanelProps {
  data: GestaoData
}

export function GestaoPanel({
  data
}: GestaoPanelProps) {
  const { kpis, tables } = data

  return (
    <div className='flex flex-col gap-6'>
      <KpiGrid
        items={[
          {
            label: 'Faturamento',
            value: kpis.revenue,
            type: 'money'
          },
          {
            label: 'Pedidos',
            value: kpis.orders,
            type: 'order'
          },
          {
            label: 'Devoluções',
            value: kpis.returns,
            type: 'danger'
          },
          {
            label: 'Ticket médio',
            value: kpis.averageTicket,
            type: 'money'
          },
          {
            label: 'Clientes ativos',
            value: kpis.activeCustomers,
            type: 'people'
          },
          {
            label: 'Clientes inativos',
            value: kpis.inactiveCustomers,
            type: 'danger'
          },
          {
            label: 'Usuários ativos',
            value: kpis.activeUsers,
            type: 'people'
          }
        ]}
      />

      <section className='grid grid-cols-1 gap-5 xl:grid-cols-3'>
        <DataTable
          title='Faturamento por região'
          columns={[
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
          data={tables.revenueByRegion}
        />

        <DataTable
          title='Top representantes'
          columns={[
            {
              key: 'name',
              label: 'Representante'
            },
            {
              key: 'revenue',
              label: 'Faturamento',
              format: 'currency'
            }
          ]}
          data={tables.topRepresentatives}
        />

        <DataTable
          title='Top colaboradores'
          columns={[
            {
              key: 'name',
              label: 'Colaborador'
            },
            {
              key: 'revenue',
              label: 'Faturamento',
              format: 'currency'
            }
          ]}
          data={tables.topCollaborators}
        />
      </section>
    </div>
  )
}
