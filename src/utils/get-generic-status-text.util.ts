import { GenericStatus } from '@/enums/generic-status.enum'

export function getGenericStatusText(status: string): string {
  return {
    [GenericStatus.Active]: 'Ativa',
    [GenericStatus.Inactive]: 'Inativa',
    'DRAFT': 'Rascunho'
  }[status] || status
}
