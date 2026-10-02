import { UserRole } from '@/enums/user-role.enum'
import { AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { cookies } from 'next/headers'

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
          })

          if (!response.ok) {
            await response.json()
            return null
          }

          const { data } = await response.json()

          if (!data || !data.accessToken || !data.user) {
            return null
          }

          cookies().set('accessToken', data.accessToken)

          return {
            id: Number(data.user.id),
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            status: data.user.status,
            created_at: data.user.createdAt,
            companyId: data.user.activeCompanyId || data.user.companyId,
            activeCompanyId: data.user.activeCompanyId,
            companies: data.user.companies || []
          }
        } catch (error: any) {
          console.error('Erro de autenticação:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/sign-in',
    error: '/sign-in'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = Number(user.id)
        token.role = user.role
        token.status = user.status
        token.createdAt = user.created_at
        token.companyId = user.companyId
        token.activeCompanyId = user.activeCompanyId
        token.companies = user.companies
      }
      if (trigger === 'update' && session) {
        if (session.companyId !== undefined) token.companyId = session.companyId
        if (session.activeCompanyId !== undefined) token.activeCompanyId = session.activeCompanyId
        if (session.role !== undefined) token.role = session.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.status = token.status
      session.user.createdAt = token.createdAt
      session.user.companyId = token.companyId
      session.user.activeCompanyId = token.activeCompanyId
      session.user.companies = token.companies

      // Redirecionamento com base no tipo de usuário
      if (session.user.activeCompanyId) {
        session.user.redirectUrl = `/company/${session.user.activeCompanyId}/dashboard`
      } else if (session.user.role === UserRole.Administrator) {
        session.user.redirectUrl = '/dashboard'
      }

      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60
  }
}
