import { authOptions } from '@/config/auth-options'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { serverFetch } from '@/utils/server-fetch.util'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse('Não autenticado', { status: 401 })
  }

  const url = new URL(request.url)
  const companyId = url.searchParams.get('companyId')

  if (!companyId) {
    return new NextResponse('companyId é necessário como parâmetro de busca.', { status: 400 })
  }

  const hasAccess = session.user.companies?.some(
    (c: { companyId: number }) => Number(c.companyId) === Number(companyId)
  ) || session.user.activeCompanyId === Number(companyId) || session.user.role === 'Administrator'

  if (!hasAccess) {
    return new NextResponse('Acesso negado a esta empresa', { status: 403 })
  }

  try {
    const backendUrl = `/companies/${companyId}/dashboard/filters/products`
    const response = await serverFetch<CommonResponse<string[]>>(backendUrl)

    return NextResponse.json({ data: response.data || [] })
  } catch (error) {
    console.error('Erro na rota /api/products/filters:', error)

    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    return new NextResponse(message, { status: 500 })
  }
}

