import { CompanyOrders } from '@/components/orders'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Customer } from '@/interfaces/customer.interface'
import { DefaultSearchParams } from '@/interfaces/default-search-params.interface'
import { Order } from '@/interfaces/order.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { Product } from '@/interfaces/product.interface'
import { User } from '@/interfaces/user.interface'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { fetchData } from '@/utils/fetch-data'
import { getPageParams } from '@/utils/get-page-params.util'
import { Metadata } from 'next'

interface PageProps {
  searchParams: DefaultSearchParams
  params: {
    companyId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Pedidos'
}

export default async function OrdersPage({ searchParams, params }: PageProps) {
  const { companyId } = params
  const pageParams = getPageParams({ searchParams, includeDateFilters: true })

  const baseUrl = `/company/${companyId}`
  const ordersUrl = `${baseUrl}/orders?${pageParams.toString()}`
  const customersUrl = `${baseUrl}/customer?limit=1000`
  const productsUrl = `${baseUrl}/products`
  const usersUrl = `${baseUrl}/users`

  const [ordersResponse, productsResponse, customersResponse, usersResponse] = await Promise.all([
    fetchData<PaginatedResponse<Order>>(ordersUrl, 'Falha ao buscar pedidos.'),
    fetchData<PaginatedResponse<Product>>(productsUrl, 'Falha ao buscar produtos.'),
    fetchData<PaginatedResponse<Customer>>(customersUrl, 'Falha ao buscar clientes.'),
    fetchData<PaginatedResponse<User>>(usersUrl, 'Falha ao buscar usuários.')
  ])

  const { data: orders, metadata } = ordersResponse
  const { data: products } = productsResponse
  const { data: customers } = customersResponse
  const { data: users } = usersResponse

  const orderWrapper: OrderWrapper = {
    companyId,
    orders,
    products,
    customers,
    users
  }

  return <CompanyOrders orderWrapper={orderWrapper} metadata={metadata} />
}
