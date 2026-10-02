'use client'

import { getCookie, setCookie } from 'cookies-next'

const CSRF_SECRET_KEY = 'csrf-secret'

/**
 * Generate a random string for CSRF protection.
 */
function generateRandomString(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Simple HMAC-like function using SubtleCrypto for CSRF token generation.
 */
async function generateHMAC(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Get or create a CSRF token.
 * The token is tied to a secret and can be verified server-side.
 */
export async function getCSRFToken(): Promise<string> {
  let secret = getCookie(CSRF_SECRET_KEY) as string | undefined

  if (!secret) {
    secret = generateRandomString(32)
    setCookie(CSRF_SECRET_KEY, secret, {
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false // Needs to be readable by JS
    })
  }

  const timestamp = Date.now().toString()
  const token = await generateHMAC(`${secret}:${timestamp}`, secret)

  return `${timestamp}:${token}`
}

/**
 * Verify a CSRF token (for client-side pre-validation).
 * Server should still verify independently.
 */
export async function verifyCSRFToken(token: string): Promise<boolean> {
  const secret = getCookie(CSRF_SECRET_KEY) as string | undefined
  if (!secret || !token) return false

  const [timestamp, providedHmac] = token.split(':')
  if (!timestamp || !providedHmac) return false

  // Check if token is expired (5 minutes)
  const tokenAge = Date.now() - parseInt(timestamp, 10)
  if (tokenAge > 5 * 60 * 1000) return false

  const expectedHmac = await generateHMAC(`${secret}:${timestamp}`, secret)
  return providedHmac === expectedHmac
}

/**
 * Get CSRF headers to include in API requests.
 */
export async function getCSRFHeaders(): Promise<Record<string, string>> {
  const token = await getCSRFToken()
  return {
    'X-CSRF-Token': token
  }
}
