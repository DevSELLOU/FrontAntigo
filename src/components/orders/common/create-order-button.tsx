'use client'

import { Button } from '@/components/ui/button'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { useRouter } from 'next/navigation'

export function CreateOrderButton({ orderWrapper }: { orderWrapper: OrderWrapper }) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/company/${orderWrapper.companyId}/orders/create`)
  }

  return <Button onClick={handleClick}>Novo pedido</Button>
}
