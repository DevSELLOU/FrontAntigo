import { DashboardKpi } from '@/components/shared/dashboard/dashboard-kpi'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { GenericOrdersChartResponse } from '@/interfaces/dashboard/generic-orders-chart-response.interface'
import { GenericRevenueChartResponse } from '@/interfaces/dashboard/generic-revenue-chart-response.interface'
import { fetchData } from '@/utils/fetch-data'
import { Building, Coins, DollarSign, ShoppingCartIcon, UserCheck } from 'lucide-react'
import { GenericOrdersBarChart } from '../shared/dashboard/generic-orders-bar-chart'
import { GenericRevenueBarChart } from '../shared/dashboard/generic-revenue-bar-chart'

export async function DashboardGrid() {
  const baseUrl = `/dashboard`

  /* KPI'S */

  const activeCompaniesUrl = `${baseUrl}/metrics/active-companies`
  const activeUsersUrl = `${baseUrl}/metrics/active-users`
  const totalOrdersUrl = `${baseUrl}/metrics/total-orders`
  const totalOrderValueUrl = `${baseUrl}/metrics/total-order-value`
  const averageOrderValueUrl = `${baseUrl}/metrics/average-order-value`

  const [
    activeCompaniesResponse,
    activeUsersResponse,
    totalOrdersResponse,
    totalOrderValueResponse,
    averageOrderValueResponse
  ] = await Promise.all([
    fetchData<CommonResponse<number>>(activeCompaniesUrl, 'Falha ao buscar KPI de Empresas Ativas.'),
    fetchData<CommonResponse<number>>(activeUsersUrl, 'Falha ao buscar KPI de Usuários Ativos.'),
    fetchData<CommonResponse<number>>(totalOrdersUrl, 'Falha ao buscar KPI de Total de Pedidos.'),
    fetchData<CommonResponse<number>>(totalOrderValueUrl, 'Falha ao buscar KPI de Receita de Pedidos.'),
    fetchData<CommonResponse<number>>(averageOrderValueUrl, 'Falha ao buscar KPI de Valor médio de pedidos.')
  ])

  const { data: activeCompanies } = activeCompaniesResponse
  const { data: activeUsers } = activeUsersResponse
  const { data: totalOrders } = totalOrdersResponse
  const { data: totalOrderValue } = totalOrderValueResponse
  const { data: averageOrderValue } = averageOrderValueResponse

  /* CHARTS */

  const revenueByCompanyUrl = `${baseUrl}/charts/revenue-by-company`
  const ordersByCompanyUrl = `${baseUrl}/charts/orders-by-company`
  const ordersPerDayUrl = `${baseUrl}/charts/orders-per-day`
  const revenuePerDayUrl = `${baseUrl}/charts/revenue-per-day`

  const [ordersByCompanyResponse, ordersPerDayResponse, revenuePerDayResponse, revenueByCompanyResponse] =
    await Promise.all([
      fetchData<CommonResponse<GenericOrdersChartResponse[]>>(
        ordersByCompanyUrl,
        'Falha ao buscar gráfico de Pedidos por Empresa.'
      ),
      fetchData<CommonResponse<GenericOrdersChartResponse[]>>(
        ordersPerDayUrl,
        'Falha ao buscar gráfico de Pedidos por Dia.'
      ),
      fetchData<CommonResponse<GenericRevenueChartResponse[]>>(
        revenuePerDayUrl,
        'Falha ao buscar gráfico de Receita por Dia.'
      ),
      fetchData<CommonResponse<GenericRevenueChartResponse[]>>(
        revenueByCompanyUrl,
        'Falha ao buscar gráfico de Receita por Empresa.'
      )
    ])

  const { data: revenueByCompany } = revenueByCompanyResponse
  const { data: ordersByCompany } = ordersByCompanyResponse
  const { data: ordersPerDay } = ordersPerDayResponse
  const { data: revenuePerDay } = revenuePerDayResponse

  return (
    <div className='flex flex-col gap-6'>
      <section aria-label='Indicadores gerais' className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4'>
        <DashboardKpi
          title='Receita de pedidos'
          value={totalOrderValue}
          isCurrency
          featured
          icon={<DollarSign size={16} />}
          className='sm:col-span-2 xl:col-span-1'
        />
        <DashboardKpi title='Total de pedidos' value={totalOrders} icon={<ShoppingCartIcon size={16} />} />
        <DashboardKpi title='Valor médio de pedidos' value={averageOrderValue} isCurrency icon={<Coins size={16} />} />
        <DashboardKpi title='Empresas ativas' value={activeCompanies} icon={<Building size={16} />} />
        <DashboardKpi title='Usuários ativos' value={activeUsers} icon={<UserCheck size={16} />} />
      </section>

      <section aria-label='Gráficos de operação' className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
        <GenericOrdersBarChart
          data={ordersPerDay}
          title='Pedidos por dia'
          description='Quantidade de pedidos por dia'
        />
        <GenericRevenueBarChart
          data={revenuePerDay}
          title='Receita por dia'
          description='Receita total por dia'
        />
      </section>

      <section aria-label='Comparativo por empresa' className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
        <GenericRevenueBarChart
          data={revenueByCompany}
          title='Receita por empresa'
          description='Receita total por empresa'
        />
        <GenericOrdersBarChart
          data={ordersByCompany}
          title='Pedidos por empresa'
          description='Quantidade de pedidos por empresa'
        />
      </section>
    </div>
  )
}
