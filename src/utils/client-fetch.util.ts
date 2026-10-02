'use client'

import { ResponseStatus } from '@/enums/response-status.enum'
import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import { getCookie } from 'cookies-next'
import { getCSRFToken } from './csrf.util'
import { isApiErrorResponse } from './is-api-error-response.util'
import { isRequestAllowed, RATE_LIMIT_CONFIGS } from './rate-limit.util'

interface ClientFetchAdditionalOptions {
  shopAccessToken?: string
  handleTokenExpired?: () => void
}

const generateCorrelationId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

interface LogEntry {
  correlationId: string
  timestamp: string
  method: string
  url: string
  status?: number
  duration?: number
  userId?: string
  error?: string
}

const logApiRequest = (entry: LogEntry) => {
  const log = `[API] ${entry.correlationId} | ${entry.method} ${entry.url} | ${entry.status || 'pending'} | ${entry.duration ? `${entry.duration}ms` : '-'}`

  if (entry.status && entry.status >= 400) {
    console.error(`${log} | userId: ${entry.userId || 'unknown'} | error: ${entry.error || '-'}`)
  } else {
    console.log(log)
  }
}

/**
 * Check if the HTTP method is state-changing and requires CSRF protection.
 */
function requiresCSRF(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
}

/**
 * Get the rate limit key based on URL and method.
 */
function getRateLimitKey(url: string, method: string): string {
  // Auth endpoints
  if (url.includes('/auth/')) {
    return `auth:${method}`
  }

  // Write operations
  if (requiresCSRF(method)) {
    return `write:${url}`
  }

  // Search endpoints
  if (url.includes('/search') || url.includes('?q=')) {
    return `search:${url}`
  }

  // General API
  return `api:${method}:${url}`
}

/**
 * Get the rate limit configuration based on endpoint type.
 */
function getRateLimitConfig(url: string, method: string) {
  if (url.includes('/auth/')) {
    return RATE_LIMIT_CONFIGS.auth
  }

  if (requiresCSRF(method)) {
    return RATE_LIMIT_CONFIGS.write
  }

  if (url.includes('/search') || url.includes('?q=')) {
    return RATE_LIMIT_CONFIGS.search
  }

  return RATE_LIMIT_CONFIGS.api
}

export async function clientFetch<T>(
  url: string,
  options: RequestInit,
  { shopAccessToken, handleTokenExpired }: ClientFetchAdditionalOptions = {
    shopAccessToken: '',
    handleTokenExpired: undefined
  }
): Promise<ApiErrorResponse | T> {
  const correlationId = generateCorrelationId()
  const startTime = performance.now()

  const adminAccessToken = getCookie('accessToken')
  const accessToken = shopAccessToken || adminAccessToken

  const userId = getCookie('userId') as string | undefined
  const method = options.method || 'GET'

  // Apply rate limiting based on endpoint type
  const rateLimitKey = getRateLimitKey(url, method)
  const rateLimitConfig = getRateLimitConfig(url, method)

  if (!isRequestAllowed(rateLimitKey, rateLimitConfig)) {
    const resetTime = Math.ceil(rateLimitConfig.windowMs / 1000)
    throw new Error(`Rate limit exceeded. Please try again in ${resetTime} seconds.`)
  }

  logApiRequest({
    correlationId,
    timestamp: new Date().toISOString(),
    method,
    url,
    userId
  })

  try {
    // Build headers with CSRF token for state-changing methods
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
      'X-Correlation-ID': correlationId,
      Authorization: `Bearer ${accessToken}`
    }

    if (requiresCSRF(method)) {
      const csrfToken = await getCSRFToken()
      headers['X-CSRF-Token'] = csrfToken
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers
    })

    const duration = Math.round(performance.now() - startTime)

    if (response.status !== 200) {
      if (response?.statusText === ResponseStatus.TokenExpired) {
        handleTokenExpired?.()
      }
    }

    const responseData = await response?.json()

    logApiRequest({
      correlationId,
      timestamp: new Date().toISOString(),
      method,
      url,
      status: response.status,
      duration,
      userId,
      error: response.status >= 400 ? JSON.stringify(responseData) : undefined
    })

    if (isApiErrorResponse(responseData)) {
      console.error(`[API_ERROR] ${correlationId} | Message: ${responseData.message} | Status: ${responseData.statusCode} | Error: ${responseData.error || 'N/A'}`)
      throw new Error(responseData.message)
    }

    try {
      return responseData
    } catch (error) {
      console.error(`[API_PARSE_ERROR] ${correlationId}`, error)
      throw new Error('Erro ao fazer parse da resposta JSON')
    }
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)

    logApiRequest({
      correlationId,
      timestamp: new Date().toISOString(),
      method,
      url,
      status: 0,
      duration,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    throw error
  }
}
