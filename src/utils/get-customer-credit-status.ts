import { Customer } from '@/interfaces/customer.interface'

type LimitStatus = 'critical' | 'low' | 'good' | 'no-limit'
type CreditStatus = {
  status: LimitStatus
  label: string
}

export function getCustomerCreditStatus(customer: Customer | null): CreditStatus {
  if (!customer) return { status: 'no-limit', label: 'Sem Limite' }

  const limit = Number(customer.creditLimit || '0')
  const used = Number(customer.creditLimitUsed || '0')
  const isNoLimit = limit === 0 || used >= limit

  if (isNoLimit) return { status: 'no-limit', label: 'Sem Limite' }

  const percentage = (used / limit) * 100

  if (percentage >= 90) return { status: 'critical', label: 'Limite Crítico' }
  if (percentage >= 70) return { status: 'low', label: 'Limite Baixo' }
  return { status: 'good', label: 'Limite Adequado' }
}

export function getCustomerCreditStatusClasses(status: LimitStatus): string {
  switch (status) {
    case 'critical':
      return 'bg-danger text-danger-foreground border-danger-border'
    case 'low':
      return 'bg-warning text-warning-foreground border-warning-border'
    case 'good':
      return 'bg-success text-success-foreground border-success-border'
    case 'no-limit':
      return 'bg-surface-muted text-text-muted border-border'
    default:
      return 'bg-surface-muted text-text-muted border-border'
  }
}
