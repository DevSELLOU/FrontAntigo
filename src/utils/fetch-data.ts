import { isApiErrorResponse } from './is-api-error-response.util'
import { serverFetch } from './server-fetch.util'

export async function fetchData<T>(url: string, errorMsg: string): Promise<T> {
  const response = await serverFetch<T>(url, { method: 'GET' })
  if (isApiErrorResponse(response)) {
    throw new Error(response.message || errorMsg)
  }
  return response
}
