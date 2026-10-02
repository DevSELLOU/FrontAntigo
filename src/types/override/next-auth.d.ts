import 'next-auth'

declare module 'next-auth' {
  interface UserCompany {
    userCompanyId: number
    companyId: number
    companyName: string
    fantasyName: string
    role: string
    logoUrl?: string
  }

  interface User {
    id: number
    role: string
    status: string
    created_at: string
    companyId?: number
    activeCompanyId?: number
    companies?: UserCompany[]
  }

  interface Session {
    user: {
      id: number
      role: string
      status: string
      createdAt: string
      companyId?: number
      activeCompanyId?: number
      companies?: UserCompany[]
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: number
    role?: string
    status?: string
    createdAt?: string
    companyId?: number
    activeCompanyId?: number
    companies?: import('next-auth').UserCompany[]
  }
}
