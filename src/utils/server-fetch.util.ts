import { ResponseStatus } from '@/enums/response-status.enum'
import { CustomError } from '@/errors/custom-error.error'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isApiErrorResponse } from './is-api-error-response.util'

const getTimestamp = (): string => new Date().toISOString()

const logWithTimestamp = (message: string, ...args: unknown[]) => {
  console.error(`[${getTimestamp()}] ${message}`, ...args)
}

export async function serverFetch<T>(url: string, options: RequestInit = {}, shopAccessToken?: string): Promise<T> {
  const accessToken = shopAccessToken || cookies().get('accessToken')?.value

  const headers: HeadersInit = {
    ...options.headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  let response: Response

  try {
    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers
    })
  } catch (error) {
    logWithTimestamp('Network request failed:', error)
    throw new CustomError(
      'Oops! Parece que houve uma dificuldade de conexão. Verifique sua internet ou tente novamente em alguns minutos.'
    )
  }

  if (response.status === 401 && response.statusText === ResponseStatus.TokenExpired) {
    if (shopAccessToken) {
      throw new CustomError('Sessão expirada. Faça login novamente.')
    }
    redirect('/sign-in?session=true')
  }

  
  let responseData: unknown

  try {
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const responseText = await response.text()
      if (response.status === 429) {
        logWithTimestamp('Rate limit exceeded:', responseText)
        throw new CustomError('Número máximo de tentativas excedido. Tente novamente mais tarde.')
      }
      logWithTimestamp('Non-JSON response:', responseText)
      throw new CustomError('Parece que algo deu errado ao processar a resposta. Tente novamente em breve.')
    }
    responseData = response.status !== 204 ? await response.json() : null
  } catch (error) {
    if (error instanceof CustomError) throw error
    logWithTimestamp('Failed to parse JSON response:', error)
    throw new CustomError('Parece que algo deu errado ao processar a resposta. Tente novamente em breve.')
  }

  if (!response.ok) {
    if (response.status === 500) {
      logWithTimestamp('Server error:', response.statusText)
      throw new CustomError(
        'Oops! Algo não saiu como esperado. Se o problema continuar, por favor, avise a nossa equipe para que possamos resolver o mais rápido possível. Tente novamente em alguns minutos.'
      )
    }
    
    if (response.status === 403) {
      redirect('/forbidden')
    }
  

    if (isApiErrorResponse(responseData)) {
      logWithTimestamp('API error:', responseData.message)
      throw new CustomError(responseData.message || 'Recebemos uma resposta inesperada. Tente novamente em breve.')
    }
    throw new CustomError(
      `Houve uma situação inesperada. Tente novamente em alguns minutos. ${response.statusText || response.status}`
    )
  }

  return responseData as T
}
