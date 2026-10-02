import { OrderForm } from '@/components/orders/common/form/order-form'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { Customer } from '@/interfaces/customer.interface'
import { Order } from '@/interfaces/order.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { Product } from '@/interfaces/product.interface'
import { User } from '@/interfaces/user.interface'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { fetchData } from '@/utils/fetch-data'
import { Metadata } from 'next'

interface PageProps {
  params: {
    companyId: number
    orderId: string
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Editar Pedido'
}

export default async function EditOrderPage({ params }: PageProps) {
  const { companyId, orderId } = params

  const baseUrl = `/company/${companyId}`
  const orderUrl = `${baseUrl}/orders/${orderId}`
  const customersUrl = `${baseUrl}/customer?limit=50&filters={"status":{"eq":"${CustomerStatus.Active}"}}`
  const productsUrl = `${baseUrl}/products?limit=100`
  const usersUrl = `${baseUrl}/users`

  const [orderResponse, productsResponse, customersResponse, usersResponse] = await Promise.all([
    fetchData<CommonResponse<Order>>(orderUrl, 'Falha ao buscar pedido.'),
    fetchData<PaginatedResponse<Product>>(productsUrl, 'Falha ao buscar produtos.'),
    fetchData<PaginatedResponse<Customer>>(customersUrl, 'Falha ao buscar clientes.'),
    fetchData<PaginatedResponse<User>>(usersUrl, 'Falha ao buscar usuários.')
  ])

  const { data: order } = orderResponse
  const { data: products } = productsResponse
  const { data: customers } = customersResponse
  const { data: users } = usersResponse

  const orderWrapper: OrderWrapper = {
    companyId,
    orders: [order],
    products,
    customers: customers.filter(customer => customer.status === CustomerStatus.Active),
    users
  }

  return <OrderForm orderWrapper={orderWrapper} order={order} />
}
