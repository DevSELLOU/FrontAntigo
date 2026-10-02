'use client'

import { useShopAuth } from '@/hooks/use-shop-auth'
import { Company } from '@/interfaces/company.interface'
import { createContext, ReactNode, useEffect, useReducer } from 'react'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  /** Teto para o `+` do carrinho. Sem isto o comprador pedia mais do que existe e só descobria
   *  depois, no atendimento. Ausente = produto sem controle de estoque. */
  stock?: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLEAR_CART'; clearLocalStorage?: boolean }

export const ShopContext = createContext<
  | {
      state: CartState
      dispatch: React.Dispatch<CartAction>
      company?: Company
    }
  | undefined
>(undefined)

export function ShopProvider({ children, company }: { children: ReactNode; company?: Company }) {
  const { user } = useShopAuth()

  const localStorageKey = user ? `cart:${user.id}` : 'cart:guest'

  function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
      case 'ADD_ITEM': {
        // O reducer IGNORAVA `payload.quantity` e somava 1 sempre — um seletor de quantidade no
        // card seria decorativo. Agora respeita o que foi pedido, limitado ao estoque.
        const requested = Math.max(1, action.payload.quantity || 1)
        const existingItem = state.items.find(item => item.id === action.payload.id)
        const ceiling = action.payload.stock

        if (existingItem) {
          const merged = existingItem.quantity + requested

          return {
            ...state,
            items: state.items.map(item =>
              item.id === action.payload.id
                ? { ...item, stock: ceiling, quantity: ceiling ? Math.min(merged, ceiling) : merged }
                : item
            )
          }
        }

        return {
          ...state,
          items: [
            ...state.items,
            { ...action.payload, quantity: ceiling ? Math.min(requested, ceiling) : requested }
          ]
        }
      }
      case 'REMOVE_ITEM':
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload)
        }
      case 'UPDATE_QUANTITY':
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
          )
        }
      case 'TOGGLE_CART':
        return {
          ...state,
          isOpen: !state.isOpen
        }
      case 'CLEAR_CART': {
        if (action.clearLocalStorage) {
          localStorage.removeItem(localStorageKey)
        }

        return {
          ...state,
          items: []
        }
      }

      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(
    cartReducer,
    {
      items: [],
      isOpen: false
    },
    () => {
      if (typeof window !== 'undefined') {
        const storedState = localStorage.getItem(localStorageKey)
        return storedState ? JSON.parse(storedState) : { items: [], isOpen: false }
      }
      return { items: [], isOpen: false }
    }
  )

  useEffect(() => {
    if (localStorageKey) {
      localStorage.setItem(localStorageKey, JSON.stringify(state))
    }
  }, [state, localStorageKey])

  return <ShopContext.Provider value={{ state, dispatch, company }}>{children}</ShopContext.Provider>
}
