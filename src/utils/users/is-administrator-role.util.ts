import { UserRole } from '@/enums/user-role.enum'

/**
 * Whether a role administers a company (platform admin or company admin).
 *
 * Same rule `useAuth` exposes to client components, but callable from a server component — the
 * management hub needs it before rendering, to decide which tabs exist and which fetches are even
 * allowed to happen.
 */
export function isAdministratorRole(role?: string | null): boolean {
  if (!role) return false

  return [UserRole.Administrator, UserRole.CompanyAdministrator].includes(role as UserRole)
}
