import type { ApiErrorResponse } from '@/interfaces/api-error-response.interface'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { serverFetch } from './server-fetch.util'

type ServerActionOptions<_T = unknown> = {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: HeadersInit
  shopAccessToken?: string
}

export async function handleServerAction<T>(
  options: ServerActionOptions<T>
): Promise<CommonResponse<T> | ApiErrorResponse> {
  const { url, method = 'GET', body, headers = {}, shopAccessToken } = options

  try {
    const response = await serverFetch<CommonResponse<T>>(
      url,
      {
        method,
        ...(body && { body: JSON.stringify(body) }),
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      },
      shopAccessToken
    )

    return response
  } catch (error: any) {
    console.error('Error in handleServerAction:', error)

    // Identifica erros de redirecionamento do Next.js
    if (error.digest?.includes('NEXT_REDIRECT')) {
      if (error.digest?.includes('/forbidden')) {
        return {
          message: 'Você não tem permissão para executar esta ação.',
          statusCode: 403
        }
      }
      if (error.digest?.includes('/sign-in')) {
        return {
          message: 'Sessão expirada.',
          statusCode: 401
        }
      }
    }

    if (error.message?.includes('Sessão expirada')) {
      return {
        message: error.message,
        statusCode: 401
      }
    }

    return {
      message: error.message || 'Ocorreu um erro inesperado ao processar sua solicitação.',
      statusCode: 500
    }
  }
}
