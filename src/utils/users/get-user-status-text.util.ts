import { UserStatus } from '@/enums/user-status.enum'

export function getUserStatusText(status: UserStatus): string {
  return {
    [UserStatus.Active]: 'Ativo',
    [UserStatus.Inactive]: 'Inativo',
    [UserStatus.Onboarding]: 'Pendente'
  }[status]
}
