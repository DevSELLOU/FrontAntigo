import type { ApiErrorResponse } from '../interfaces/api-error-response.interface'

export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  if (!data) return false

  if (typeof data !== 'object') return false

  if (!('message' in data)) return false

  if (!('statusCode' in data)) return false

  if (typeof data.statusCode !== 'number') return false

  return true
}
