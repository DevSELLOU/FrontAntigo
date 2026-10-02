export enum UserRole {
  Administrator = 'ADMINISTRATOR',
  Ceo = 'CEO',
  CompanyAdministrator = 'COMPANY_ADMINISTRATOR',
  CustomerClient = 'CUSTOMER_CLIENT',
  DirectorOfSales = 'DIRECTOR_OF_SALES',
  NationalManager = 'NATIONAL_MANAGER',
  RegionalManager = 'REGIONAL_MANAGER',
  SalesCoordinator = 'SALES_COORDINATOR',
  SalesRep = 'SALES_REP',
}

export function isUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}
