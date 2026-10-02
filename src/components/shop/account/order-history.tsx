'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { useShop } from '@/hooks/use-shop'
import { useShopAuth } from '@/hooks/use-shop-auth'
import type { Order } from '@/interfaces/order.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { clientFetch } from '@/utils/client-fetch.util'
import { formatCurrency } from '@/utils/format/format-currency'
import { getOrderStatusBadgeStyle } from '@/utils/get-order-status-badge-style.util'
import { getOrderStatusText } from '@/utils/get-order-status-text.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronDown, Package2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import OrderHistorySkeleton from './order-history-skeleton'

export function OrderHistory() {
  const { company } = useShop()
  const companyId = company?.id
  const { user } = useShopAuth()
  const [orders, setOrders] = useState<Order[] | undefined>()
  const [openOrders, setOpenOrders] = useState<number[]>([])
  const [isFetchingOrders, setIsFetchingOrders] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) {
        setIsFetchingOrders(false)
        return
      }

      try {
        const url = `/company/${companyId}/customers/${user?.customerId}/customers-clients/${user?.id}/orders`
        const response = await clientFetch<PaginatedResponse<Order>>(url, { method: 'GET' })

        if (isApiErrorResponse(response)) {
          throw new Error(response.message)
        }

        setOrders(response.data)
      } catch (error) {
        console.error('Failed to fetch customer order:', error)
      } finally {
        setIsFetchingOrders(false)
      }
    }

    fetchData()
  }, [companyId, user?.customerId, user?.id])

  const toggleOrder = (orderId: number) => {
    setOpenOrders(current => (current.includes(orderId) ? current.filter(id => id !== orderId) : [...current, orderId]))
  }

  if (isFetchingOrders) {
    return <OrderHistorySkeleton />
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Meus Pedidos</h2>
        <p className='text-muted-foreground'>Visualize e acompanhe todos os seus pedidos.</p>
      </div>

      <div className='grid gap-4'>
        {orders?.map(order => {
          const statusText = getOrderStatusText(order?.status)
          const statusStyle = getOrderStatusBadgeStyle(order?.status)

          return (
            <Card
              key={order.id}
              className='cursor-pointer hover:shadow-md transition-shadow'
              onClick={() => toggleOrder(order.id)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-base'>Pedido #{order.id}</CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </CardDescription>
                  </div>
                  <Badge className='truncate' style={statusStyle}>
                    {statusText}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='pb-3'>
                <Collapsible
                  open={openOrders.includes(order.id)}
                  onOpenChange={() => toggleOrder(order.id)}
                  className='space-y-4'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-sm'>
                      <Package2 className='h-4 w-4 text-muted-foreground' />
                      <span>{order.orderItems.length} item(s)</span>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='text-right'>
                        <p className='text-sm text-muted-foreground'>Total</p>
                        <p className='font-medium'>{formatCurrency(order.totalValue)}</p>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0 data-[state=open]:rotate-180 transition-transform'
                          onClick={e => {
                            e.stopPropagation()
                          }}
                        >
                          <ChevronDown className='h-4 w-4' />
                          <span className='sr-only'>Mostrar detalhes</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>

                  <CollapsibleContent className='space-y-4'>
                    <Separator />
                    <div className='space-y-4'>
                      {order.orderItems.map((item, index) => (
                        <div key={index} className='grid gap-1'>
                          <div className='flex items-start justify-between'>
                            <div className='grid gap-1'>
                              <p className='text-sm font-medium leading-none'>{item.product.name}</p>
                              <div className='flex items-center gap-2'>
                                <p className='text-sm text-muted-foreground'>{item.product.brand}</p>
                                {item.product.model && (
                                  <p className='text-sm text-muted-foreground'>• {item.product.model}</p>
                                )}
                              </div>
                            </div>
                            <div className='text-right'>
                              <p className='text-sm font-medium'>{formatCurrency(Number(item.product.price))}</p>
                              <p className='text-sm text-muted-foreground'>Qtd: {item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.observation && (
                        <>
                          <Separator />
                          <div className='grid gap-1'>
                            <p className='text-sm font-medium leading-none'>Observação</p>
                            <p className='text-sm text-muted-foreground'>{order.observation}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          )
        })}

        {orders?.length === 0 && (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-8 text-center'>
              <Package2 className='h-8 w-8 text-muted-foreground mb-4' />
              <p className='text-muted-foreground'>Você ainda não realizou nenhum pedido.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
