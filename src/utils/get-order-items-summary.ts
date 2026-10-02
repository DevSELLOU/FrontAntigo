import { Product } from '@/interfaces/product.interface'

export function getOrderItemsSummary(
  orderItems: { productId: number; quantity: number }[],
  products: Product[],
  maxDisplayed: number = 2
) {
  const displayedItems = orderItems?.slice(0, maxDisplayed)

  const displayedProducts = displayedItems
    ?.map(orderItem => {
      const product = products?.find(product => product?.id === orderItem?.productId)
      return product ? `${orderItem?.quantity}x ${product?.name}` : ''
    })
    .filter(Boolean)

  const remainingCount = orderItems?.length - displayedItems?.length

  return {
    displayedProducts: displayedProducts?.join(', '),
    remainingCount
  }
}
