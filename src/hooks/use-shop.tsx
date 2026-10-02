import { ShopContext } from '@/contexts/shop-context'
import { useContext } from 'react'

export function useShop() {
  const context = useContext(ShopContext)
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider')
  }
  return context
}
