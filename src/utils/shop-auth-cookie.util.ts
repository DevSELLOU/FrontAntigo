'use client'

import { User } from '@/interfaces/user.interface'
import { getCookie } from 'cookies-next'

/**
 * Get the shop access token from httpOnly cookie.
 * Note: httpOnly cookies cannot be read by JavaScript directly.
 * This function reads from a non-httpOnly backup cookie for client-side usage.
 * The actual auth token is in the httpOnly cookie sent with requests.
 */
export function getShopAccessToken(): string | undefined {
  return getCookie('shopAccessToken') as string | undefined
}

/**
 * Get the shop user data from cookie.
 */
export function getShopUser(): User | undefined {
  const userStr = getCookie('shopUser') as string | undefined
  if (!userStr) return undefined

  try {
    return JSON.parse(userStr) as User
  } catch {
    return undefined
  }
}

/**
 * Check if the user is authenticated by checking for the presence of tokens.
 */
export function isShopAuthenticated(): boolean {
  return !!getCookie('shopAccessToken')
}
