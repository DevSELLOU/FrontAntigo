import { authOptions } from '@/config/auth-options'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { serverFetch } from '@/utils/server-fetch.util'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

interface Manager {
  id: number
  name: string
}

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

  const backendUrl = `/companies/${companyId}/dashboard/filters/managers`
  const response = await serverFetch<CommonResponse<Manager[]>>(backendUrl)

  const managers = response.data || []
  return NextResponse.json({ data: managers })
}
