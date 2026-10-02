import { clientFetch } from '@/utils/client-fetch.util'

export async function splitOrderAction(
  companyId: number,
  orderId: number,
  items: { productId: number; quantity: number }[]
) {
  const response = await clientFetch<{
    message: string
    data: {
      originalOrder: any
      newOrder: any
    }
  }>(`/company/${companyId}/orders/${orderId}/split`, {
    method: 'POST',
    body: JSON.stringify({ items }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return response
}
