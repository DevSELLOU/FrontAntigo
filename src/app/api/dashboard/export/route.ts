import { authOptions } from '@/config/auth-options'
import { serverFetch } from '@/utils/server-fetch.util'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Não autenticado', { status: 401 })
  }

  const body = await request.json()
  const { companyId, mode, report, tab } = body

  if (!companyId) {
    return new NextResponse('companyId é necessário.', { status: 400 })
  }

  const hasAccess = session.user.companies?.some(
    (c: { companyId: number }) => Number(c.companyId) === Number(companyId)
  ) || session.user.activeCompanyId === Number(companyId) || session.user.role === 'Administrator'

  if (!hasAccess) {
    return new NextResponse('Acesso negado a esta empresa', { status: 403 })
  }

  const backendUrl = `/companies/${companyId}/dashboard/export`
  const response = await serverFetch<any>(backendUrl, {
    method: 'POST',
    body: JSON.stringify({ mode, report, tab }),
  })

  return NextResponse.json(response)
}
