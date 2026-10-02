import type { User } from '@/interfaces/user.interface'

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
