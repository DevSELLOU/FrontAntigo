import { AccessRequestStatus } from '@/enums/access-request-status.enum'

export function getAccessRequestStatusText(status: AccessRequestStatus): string {
  return {
    [AccessRequestStatus.Pending]: 'Pendente',
    [AccessRequestStatus.Realized]: 'Realizada'
  }[status]
}
