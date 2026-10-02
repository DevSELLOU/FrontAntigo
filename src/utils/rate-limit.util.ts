'use client'

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Clean up expired entries from the rate limit store.
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Check if a request is allowed based on rate limiting.
 * Returns true if the request is allowed, false if rate limited.
 */
export function isRequestAllowed(key: string, config: RateLimitConfig): boolean {
  cleanupExpiredEntries()

  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return true
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return false
  }

  // Increment count
  entry.count++
  return true
}

/**
 * Get the time remaining until the rate limit resets (in milliseconds).
 */
export function getRateLimitResetTime(key: string): number {
  const entry = rateLimitStore.get(key)
  if (!entry) return 0

  const now = Date.now()
  return Math.max(0, entry.resetTime - now)
}

/**
 * Get the number of requests remaining in the current window.
 */
export function getRemainingRequests(key: string, config: RateLimitConfig): number {
  cleanupExpiredEntries()

  const entry = rateLimitStore.get(key)
  if (!entry || Date.now() > entry.resetTime) {
    return config.maxRequests
  }

  return Math.max(0, config.maxRequests - entry.count)
}

/**
 * Reset the rate limit for a specific key.
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}

/**
 * Predefined rate limit configurations for different endpoint types.
 */
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - stricter limits
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000 // 15 minutes
  },
  // General API endpoints
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000 // 1 minute
  },
  // Write operations
  write: {
    maxRequests: 30,
    windowMs: 60 * 1000 // 1 minute
  },
  // Search endpoints
  search: {
    maxRequests: 20,
    windowMs: 60 * 1000 // 1 minute
  }
} as const

/**
 * Rate limit decorator for API calls.
 * Usage: withRateLimit('endpoint-key', config, () => fetch(...))
 */
export async function withRateLimit<T>(
  key: string,
  config: RateLimitConfig,
  fn: () => Promise<T>
): Promise<T> {
  if (!isRequestAllowed(key, config)) {
    const resetTime = getRateLimitResetTime(key)
    const seconds = Math.ceil(resetTime / 1000)
    throw new Error(`Rate limit exceeded. Please try again in ${seconds} seconds.`)
  }

  return fn()
}
