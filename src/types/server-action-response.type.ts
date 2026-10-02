import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'

export type ServerActionResponse<T> = T | ApiErrorResponse
