import { CustomerProfileHeader } from '@/components/customers/profile/customer-profile-header'
import { CustomerProfileTabs } from '@/components/customers/profile/customer-profile-tabs'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { Customer } from '@/interfaces/customer.interface'
import { CustomerUser } from '@/interfaces/customer-user.interface'
import { Order } from '@/interfaces/order.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { Segment } from '@/interfaces/segment.interface'
import { fetchData } from '@/utils/fetch-data'
import { getPageParams } from '@/utils/get-page-params.util'
import { Metadata } from 'next'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
  params: {
    companyId: number
    customerId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Perfil do Cliente'
}

export default async function CustomerProfilePage({ params, searchParams }: PageProps) {
  const { companyId, customerId } = params
  const pageParams = getPageParams({ searchParams, includeDateFilters: false })

  const baseUrl = `/company/${companyId}`
  const customerUrl = `${baseUrl}/customer/${customerId}`
  const ordersUrl = `${baseUrl}/orders?filters=${encodeURIComponent(
    JSON.stringify({ customerId: { eq: customerId } })
  )}&sort=${encodeURIComponent(JSON.stringify({ createdAt: 'desc' }))}&limit=1`
  const customersUsersUrl = `${baseUrl}/customers/${customerId}/customers-clients?${pageParams}`
  const segmentsUrl = `${baseUrl}/segments`
  const paymentConditionsUrl = `${baseUrl}/payment-condition`
  const paymentMethodsUrl = `${baseUrl}/payment-method`

  const [customerResponse, ordersResponse, customerUsersResponse, segmentsResponse, paymentConditionsResponse, paymentMethodsResponse] = await Promise.all([
    fetchData<CommonResponse<Customer>>(customerUrl, 'Falha ao buscar dados do cliente.'),
    fetchData<PaginatedResponse<Order>>(ordersUrl, 'Falha ao buscar pedidos do cliente.'),
    fetchData<PaginatedResponse<CustomerUser>>(customersUsersUrl, 'Falha ao buscar usuários do cliente.'),
    fetchData<PaginatedResponse<Segment>>(segmentsUrl, 'Falha ao buscar segmentos.'),
    fetchData<PaginatedResponse<PaymentCondition>>(paymentConditionsUrl, 'Falha ao buscar condições de pagamento.'),
    fetchData<PaginatedResponse<PaymentMethod>>(paymentMethodsUrl, 'Falha ao buscar métodos de pagamento.')
  ])

  const customer = customerResponse.data

  if (!customer) {
    throw new Error('Nenhum cliente encontrado para o ID informado.')
  }

  const latestOrder = ordersResponse.data?.[0]
  const daysSinceLastOrder = latestOrder
    ? computeDaysSinceLastOrder(latestOrder.createdAt)
    : undefined

  const { data: customerUsers, metadata: customerUsersMetadata } = customerUsersResponse
  const { data: segments } = segmentsResponse
  const { data: paymentConditions } = paymentConditionsResponse
  const { data: paymentMethods } = paymentMethodsResponse

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <CustomerProfileHeader customer={customer} companyId={companyId} />
      <CustomerProfileTabs
        customer={customer}
        companyId={companyId}
        daysSinceLastOrder={daysSinceLastOrder}
        customerUsers={customerUsers}
        customerUsersMetadata={customerUsersMetadata}
        segments={segments}
        paymentConditions={paymentConditions}
        paymentMethods={paymentMethods}
        initialTab={searchParams?.tab}
        syncUrl
      />
    </div>
  )
}

function computeDaysSinceLastOrder(createdAt: string | Date): string {
  const orderDate = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - orderDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  return `Há ${diffDays} dias`
}
