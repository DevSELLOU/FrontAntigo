import { ShopOrderSuccessPage } from '@/components/shop-checkout/checkout-success'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Sucesso'
}

export default function OrderSuccessPage() {
  return <ShopOrderSuccessPage />
}
