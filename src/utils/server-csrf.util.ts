import { cookies } from 'next/headers'

const CSRF_SECRET_KEY = 'csrf-secret'

/**
 * Simple HMAC-like function using Node.js crypto for server-side CSRF verification.
 */
async function verifyHMAC(message: string, secret: string, providedHmac: string): Promise<boolean> {
  const { createHmac } = await import('crypto')
  const hmac = createHmac('sha256', secret).update(message).digest('hex')
  return hmac === providedHmac
}

/**
 * Verify a CSRF token on the server side.
 * Returns true if the token is valid, false otherwise.
 */
export async function verifyCSRFToken(token: string | null): Promise<boolean> {
  if (!token) return false

  const secret = cookies().get(CSRF_SECRET_KEY)?.value
  if (!secret) return false

  const [timestamp, providedHmac] = token.split(':')
  if (!timestamp || !providedHmac) return false

  // Check if token is expired (5 minutes)
  const tokenAge = Date.now() - parseInt(timestamp, 10)
  if (tokenAge > 5 * 60 * 1000) return false

  return verifyHMAC(`${secret}:${timestamp}`, secret, providedHmac)
}

/**
 * Middleware helper to validate CSRF token from request headers.
 * Use this in API routes that handle state-changing operations.
 */
export async function validateCSRF(request: Request): Promise<{ valid: boolean; error?: string }> {
  // Only validate for state-changing methods
  const method = request.method.toUpperCase()
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return { valid: true }
  }

  const csrfToken = request.headers.get('X-CSRF-Token')
  if (!csrfToken) {
    return { valid: false, error: 'Missing CSRF token' }
  }

  const isValid = await verifyCSRFToken(csrfToken)
  if (!isValid) {
    return { valid: false, error: 'Invalid or expired CSRF token' }
  }

  return { valid: true }
}
