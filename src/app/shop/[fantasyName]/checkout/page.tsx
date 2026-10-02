import { ShopCheckoutPage } from '@/components/shop-checkout/checkout-page'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Checkout'
}

export default function CheckoutPage() {
  return <ShopCheckoutPage />
}
