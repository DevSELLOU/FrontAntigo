import { OrderForm } from '@/components/orders/common/form/order-form'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { Customer } from '@/interfaces/customer.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { Product } from '@/interfaces/product.interface'
import { User } from '@/interfaces/user.interface'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { fetchData } from '@/utils/fetch-data'
import { Metadata } from 'next'

interface PageProps {
  params: {
    companyId: number
  }
  searchParams: {
    customerId?: string
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Novo Pedido'
}

export default async function CreateOrderPage({ params, searchParams }: PageProps) {
  const { companyId } = params

  const baseUrl = `/company/${companyId}`
  const customersUrl = `${baseUrl}/customer?limit=50&filters={"status":{"eq":"${CustomerStatus.Active}"}}`
  const productsUrl = `${baseUrl}/products?limit=100`
  const usersUrl = `${baseUrl}/users`

  const [productsResponse, customersResponse, usersResponse] = await Promise.all([
    fetchData<PaginatedResponse<Product>>(productsUrl, 'Falha ao buscar produtos.'),
    fetchData<PaginatedResponse<Customer>>(customersUrl, 'Falha ao buscar clientes.'),
    fetchData<PaginatedResponse<User>>(usersUrl, 'Falha ao buscar usuários.')
  ])

  const { data: products } = productsResponse
  const { data: customers } = customersResponse
  const { data: users } = usersResponse

  const orderWrapper: OrderWrapper = {
    companyId,
    orders: [],
    products,
    customers,
    users
  }

  const preSelectedCustomerId = searchParams.customerId
    ? Number(searchParams.customerId)
    : undefined

  return <OrderForm orderWrapper={orderWrapper} preSelectedCustomerId={preSelectedCustomerId} />
}
