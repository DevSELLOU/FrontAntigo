import { ShopAuthContext, ShopAuthContextType } from '@/contexts/shop-auth-context'
import { useContext } from 'react'

export const useShopAuth = (): ShopAuthContextType => {
  const context = useContext(ShopAuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
