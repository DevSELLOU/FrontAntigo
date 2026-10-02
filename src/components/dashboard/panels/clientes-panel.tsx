import { DataTable } from '@/components/shared/data-table'
import { KpiGrid } from '@/components/shared/kpi-grid'
import type { ClientesData } from '@/interfaces/dashboard/dashboard-v2.types'
import {
  CalendarClock,
  CircleDollarSign,
  MapPinOff,
  RotateCcw,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users
} from 'lucide-react'

interface ClientesPanelProps {
  data: ClientesData
}

export function ClientesPanel({ data }: ClientesPanelProps) {
  const { kpis, tables } = data

  return (
    <div className='flex flex-col gap-6'>
      <KpiGrid
        items={[
          {
            label: 'Clientes cadastrados',
            value: kpis.totalCustomers,
            type: 'people',
            icon: Users
          },
          {
            label: 'Clientes sem compras +90d',
            value: kpis.inactiveCustomers,
            type: 'danger',
            icon: UserMinus
          },
          {
            label: 'Clientes ativos',
            value: kpis.activeCustomers,
            type: 'people',
            icon: UserCheck
          },
          {
            label: 'Clientes inativos',
            value: kpis.inactiveCustomers,
            type: 'danger',
            icon: UserMinus
          },
          {
            label: 'Cidades sem faturamento',
            value: kpis.citiesWithoutFaturamento,
            type: 'warning',
            icon: MapPinOff
          },
          {
            label: 'Ciclo de compras',
            value: `${new Intl.NumberFormat('pt-BR').format(
              kpis.purchaseCycle
            )} dias`,
            type: 'order',
            icon: CalendarClock
          },
          {
            label: 'Clientes novos',
            value: kpis.newCustomerCount,
            type: 'people',
            icon: UserPlus
          },
          {
            label: 'Faturamento clientes novos',
            value: kpis.newCustomerRevenue,
            type: 'money',
            icon: CircleDollarSign
          },
          {
            label: 'Taxa de conversão',
            value: kpis.conversionRate,
            type: 'percent',
            icon: TrendingUp
          },
          {
            label: 'Clientes reativados',
            value: kpis.reactivatedCount,
            type: 'people',
            icon: RotateCcw
          },
          {
            label: 'Faturamento clientes reativados',
            value: kpis.reactivatedRevenue,
            type: 'money',
            icon: CircleDollarSign
          },
          {
            label: 'Taxa de reativação',
            value: kpis.reactivationRate,
            type: 'percent',
            icon: TrendingUp
          }
        ]}
      />

      <section className='grid grid-cols-1 gap-5 xl:grid-cols-2'>
        <DataTable
          title='Clientes por canal'
          columns={[
            {
              key: 'channel',
              label: 'Canal'
            },
            {
              key: 'count',
              label: 'Clientes',
              format: 'number'
            }
          ]}
          data={tables.customersByChannel}
        />

        <DataTable
          title='Clientes do canal selecionado'
          columns={[
            {
              key: 'name',
              label: 'Cliente'
            },
            {
              key: 'city',
              label: 'Cidade'
            },
            {
              key: 'revenue',
              label: 'Valor de compra',
              format: 'currency'
            },
            {
              key: 'orders',
              label: 'Pedidos',
              format: 'number'
            }
          ]}
          data={tables.customersByChannelDetails}
        />
      </section>

      <section className='grid grid-cols-1 gap-5 xl:grid-cols-2'>
        <DataTable
          title='Clientes por cidade'
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
              key: 'clients',
              label: 'Clientes',
              format: 'number'
            },
            {
              key: 'revenue',
              label: 'Faturamento',
              format: 'currency'
            }
          ]}
          data={tables.customersByCity}
        />

        <DataTable
          title='Inativos +90 dias por representante'
          columns={[
            {
              key: 'representative',
              label: 'Representante'
            },
            {
              key: 'count',
              label: 'Clientes +90d',
              format: 'number'
            },
            {
              key: 'lastPurchaseValue',
              label: 'Valor da última compra',
              format: 'currency'
            }
          ]}
          data={tables.inactive90DaysByRep}
        />
      </section>

      <section className='grid grid-cols-1 gap-5 xl:grid-cols-2'>
        <DataTable
          title='Inativos +90 dias por colaborador'
          columns={[
            {
              key: 'representative',
              label: 'Colaborador'
            },
            {
              key: 'count',
              label: 'Clientes +90d',
              format: 'number'
            },
            {
              key: 'lastPurchaseValue',
              label: 'Valor da última compra',
              format: 'currency'
            }
          ]}
          data={tables.inactive90DaysByColab}
        />

        <DataTable
          title='Detalhamento por divisão do colaborador'
          columns={[
            {
              key: 'collaborator',
              label: 'Colaborador'
            },
            {
              key: 'clients',
              label: 'Clientes',
              format: 'number'
            },
            {
              key: 'inactive90Days',
              label: 'Clientes +90d',
              format: 'number'
            },
            {
              key: 'orders',
              label: 'Pedidos',
              format: 'number'
            },
            {
              key: 'revenue',
              label: 'Faturamento',
              format: 'currency'
            }
          ]}
          data={tables.divisionBreakdown}
        />
      </section>

      <DataTable
        title='Clientes inativos há mais de 90 dias'
        columns={[
          {
            key: 'name',
            label: 'Cliente'
          },
          {
            key: 'document',
            label: 'CNPJ / ID'
          },
          {
            key: 'city',
            label: 'Cidade'
          },
          {
            key: 'lastPurchase',
            label: 'Última compra'
          },
          {
            key: 'lastPurchaseValue',
            label: 'Valor da última compra',
            format: 'currency'
          }
        ]}
        data={tables.inactive90Days}
      />
    </div>
  )
}
