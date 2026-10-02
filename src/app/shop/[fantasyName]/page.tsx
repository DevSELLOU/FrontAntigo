import { ShopPage } from '@/components/shop/shop-page'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Novo Pedido'
}

export default function Shop() {
  return <ShopPage />
}
