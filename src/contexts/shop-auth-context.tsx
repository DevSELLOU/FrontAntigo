import { ScreenLoading } from '@/components/ui/screen-loading'
import { User } from '@/interfaces/user.interface'
import { getShopAccessToken, getShopUser } from '@/utils/shop-auth-cookie.util'
import { setCookie, deleteCookie } from 'cookies-next'
import { createContext, ReactNode, useEffect, useState } from 'react'

export interface ShopAuthContextType {
  accessToken: string | undefined
  user: User | undefined
  signIn: (accessToken: string, user: User) => void
  signOut: () => void
  isAuthenticated: boolean
  isLoginLoading: boolean
}

export const ShopAuthContext = createContext<ShopAuthContextType | undefined>(undefined)

export const ShopAuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined)
  const [user, setUser] = useState<User | undefined>(undefined)
  const [isLoginLoading, setIsLoginLoading] = useState(true)

  useEffect(() => {
    try {
      // Read from cookies instead of localStorage
      const storedToken = getShopAccessToken()
      const storedUser = getShopUser()

      if (storedToken && storedUser) {
        setAccessToken(storedToken)
        setUser(storedUser as User)
      }
    } catch (err) {
      console.error('Failed to load auth data:', err)
    } finally {
      setIsLoginLoading(false)
    }
  }, [])

  const signIn = async (token: string, user: User) => {
    try {
      // Set cookies via API route (httpOnly for token)
      const response = await fetch('/api/auth/shop/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token, user })
      })

      if (!response.ok) {
        throw new Error('Failed to set session')
      }

      // Also set client-side cookies for immediate access
      setCookie('shopAccessToken', token, {
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })
      setCookie('shopUser', JSON.stringify(user), {
        path: '/',
        maxAge: 60 * 60 * 24,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })

      setAccessToken(token)
      setUser(user)
    } catch (err) {
      console.error('Failed to set session:', err)
      throw err
    }
  }

  const signOut = async () => {
    try {
      // Clear cookies via API route
      await fetch('/api/auth/shop/session', { method: 'DELETE' })

      // Also clear client-side cookies
      deleteCookie('shopAccessToken', { path: '/' })
      deleteCookie('shopUser', { path: '/' })

      setUser(undefined)
      setAccessToken(undefined)
    } catch (err) {
      console.error('Failed to clear session:', err)
      // Still clear state even if API fails
      setUser(undefined)
      setAccessToken(undefined)
    }
  }

  if (isLoginLoading) {
    return <ScreenLoading />
  }

  return (
    <ShopAuthContext.Provider
      value={{ accessToken, user, signIn, signOut, isLoginLoading, isAuthenticated: Boolean(user) }}
    >
      {children}
    </ShopAuthContext.Provider>
  )
}
