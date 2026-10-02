import { CustomerStatus } from "@/enums/customer-status.enum"

export function getCustomerStatusText(status: CustomerStatus): string {
  const statusMap: Record<CustomerStatus, string> = {
    [CustomerStatus.Active]: 'Ativo',
    [CustomerStatus.Inactive]: 'Inativo',
    [CustomerStatus.Defaulting]: 'Inadimplente'
  }

  return statusMap[status] || status
}
