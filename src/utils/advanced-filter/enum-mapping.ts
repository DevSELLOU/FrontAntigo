import { AccessRequestStatus } from '@/enums/access-request-status.enum'
import { CountryState } from '@/enums/country-state.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { GenericStatus } from '@/enums/generic-status.enum'
import { OrderStatus } from '@/enums/order-status.enum'
import { ProductStockType } from '@/enums/product-stock-type.enum'
import { UserRole } from '@/enums/user-role.enum'
import { UserStatus } from '@/enums/user-status.enum'

type EnumType = { [key: string]: string }

const enumMap: Record<string, EnumType> = {
  status: UserStatus,
  role: UserRole,
  state: CountryState,
  stockType: ProductStockType,
  orderStatus: OrderStatus,
  accessRequestStatus: AccessRequestStatus,
  genericStatus: GenericStatus
}

const specificEnumMap: Record<string, Record<string, EnumType>> = {
  orders: {
    status: OrderStatus
  },
  'access-requests': {
    status: AccessRequestStatus
  },
  products: {
    status: GenericStatus
  },
  users: {
    status: UserStatus
  },
  customers: {
    status: CustomerStatus
  }
}

export function getEnumForField(fieldName: string, tableName?: string): EnumType | null {
  if (tableName && specificEnumMap[tableName]?.[fieldName]) {
    return specificEnumMap[tableName][fieldName]
  }

  return enumMap[fieldName] || null
}

export function enumToOptions(enumObj: EnumType): { value: string; label: string }[] {
  return Object.entries(enumObj).map(([key, value]) => ({
    value,
    label: formatEnumLabel(key, value)
  }))
}

function formatEnumLabel(key: string, value: string): string {
  switch (value) {
    // User Status
    case UserStatus.Onboarding:
      return 'Pendente'
    case UserStatus.Active:
      return 'Ativo'
    case UserStatus.Inactive:
      return 'Inativo'

    // User Role
    case UserRole.Administrator:
      return 'Administrador'
    case UserRole.CompanyAdministrator:
      return 'Administrador da Empresa'
    case UserRole.CustomerClient:
      return 'Cliente'

    // Order Status
    case OrderStatus.OnBudget:
      return 'Em orçamento'
    case OrderStatus.InApproval:
      return 'Em aprovação'
    case OrderStatus.Approved:
      return 'Aprovado'
    case OrderStatus.Invoiced:
      return 'Faturado'
    case OrderStatus.Dispatched:
      return 'Despachado'
    case OrderStatus.Delivered:
      return 'Entregue'
    case OrderStatus.Returned:
      return 'Devolvido'

    // Product Stock Type
    case ProductStockType.INPUT:
      return 'Entrada'
    case ProductStockType.OUTPUT:
      return 'Saída'

    // Access Request Status
    case AccessRequestStatus.Pending:
      return 'Pendente'
    case AccessRequestStatus.Realized:
      return 'Realizado'

    // Generic Status
    case GenericStatus.Active:
      return 'Ativo'
    case GenericStatus.Inactive:
      return 'Inativo'

    // Customer Status
    case CustomerStatus.Active:
      return 'Ativo'
    case CustomerStatus.Inactive:
      return 'Inativo'
    case CustomerStatus.Defaulting:
      return 'Inadimplente'

    // Country States - return as is
    default:
      if (Object.values(CountryState).includes(value as CountryState)) {
        return value
      }

      return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
  }
}
