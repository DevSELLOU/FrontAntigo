import type { User } from '@/interfaces/user.interface'

export type CompanyUserRow = Omit<User, 'password' | 'password_reset_token'>

export interface CompanyUserListEntry extends Omit<CompanyUserRow, 'name' | 'email'> {
  userId: number
  user: Pick<User, 'id' | 'name' | 'email'>
}

export function normalizeCompanyUserRows(users: (CompanyUserRow | CompanyUserListEntry)[]): CompanyUserRow[] {
  return users.map(entry => {
    if (!('user' in entry)) return entry
    return {
      ...entry,
      id: entry.user.id,
      name: entry.user.name,
      email: entry.user.email
    }
  })
}

export interface SellerOption {
  id: number
  name: string
}

export function normalizeCompanyUsers(users: User[] | undefined): SellerOption[] {
  if (!users || !Array.isArray(users)) return []

  return users
    .map(user => ({
      id: (user as any).user?.id ?? user.id,
      name: (user as any).user?.name ?? user.name
    }))
    .filter((user): user is SellerOption => Boolean(user.id) && Boolean(user.name))
}
