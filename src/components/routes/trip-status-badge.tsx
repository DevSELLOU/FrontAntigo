import { StatusBadge } from '@/components/shared/status-badge'

type TripStatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

/** Single source for how a trip status reads in the representative's screens. */
export const TRIP_STATUS_CONFIG: Record<string, { label: string; variant: TripStatusVariant }> = {
  PENDING: { label: 'Viagem agendada', variant: 'neutral' },
  IN_PROGRESS: { label: 'Em andamento', variant: 'info' },
  COMPLETED: { label: 'Concluída', variant: 'success' },
  CANCELLED: { label: 'Cancelada', variant: 'danger' },
  INCOMPLETE: { label: 'Incompleta', variant: 'warning' }
}

export function TripStatusBadge({ status }: { status?: string }) {
  const config = status ? TRIP_STATUS_CONFIG[status] : undefined
  if (!config) return null

  return <StatusBadge variant={config.variant}>{config.label}</StatusBadge>
}
