/**
 * Where "Meu perfil" points from wherever the user currently is.
 *
 * The avatar menu is rendered inside two different shells — the platform one (`/dashboard`,
 * `/companies`, …) and the company one (`/company/[companyId]/…`) — and each has its own profile
 * route, because sending someone from one shell into the other just to change a password would
 * also change the sidebar under them.
 *
 * Derived from the URL rather than from the session on purpose: a platform administrator browsing
 * a company is inside that company's shell even though their own `activeCompanyId` is empty.
 */
export function resolveProfileHref(pathname: string): string {
  const companyId = pathname.match(/^\/company\/([^/]+)/)?.[1]

  return companyId ? `/company/${companyId}/profile` : '/profile'
}
