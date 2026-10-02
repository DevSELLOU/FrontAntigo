'use client'

import { useState } from 'react'
import type { ScheduledVisit } from '@/interfaces/scheduled-visit.interface'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, X } from 'lucide-react'
import { formatDateOnly } from '@/utils/date.utils'

interface ScheduledVisitsTableProps {
  visits: ScheduledVisit[]
  loading?: boolean
  onCancel?: (visitId: number) => void
}

const statusConfig: Record<string, { label: string; variant: 'outline' | 'default' | 'secondary' | 'destructive' }> = {
  PENDING: { label: 'Pendente', variant: 'outline' },
  COMPLETED: { label: 'Concluída', variant: 'secondary' },
  CANCELLED: { label: 'Cancelada', variant: 'destructive' },
}

export function ScheduledVisitsTable({ visits, loading, onCancel }: ScheduledVisitsTableProps) {
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  if (loading) {
    return (
      <div className='flex items-center justify-center h-32'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (visits.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-10 text-muted-foreground'>
        <Calendar className='h-10 w-10 mb-2' />
        <p>Nenhuma visita programada</p>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {visits.map((visit) => {
        const config = statusConfig[visit.status] || statusConfig.PENDING
        return (
          <div
            key={visit.id}
            className='flex items-center justify-between p-3 border rounded-lg bg-white'
          >
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <p className='font-medium truncate'>
                  {visit.customer?.fantasyName || `Cliente #${visit.customerId}`}
                </p>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              <div className='flex items-center gap-4 text-sm text-muted-foreground mt-1'>
                <span>Data: {formatDateOnly(visit.scheduledDate)}</span>
                {visit.user && <span>Vendedor: {visit.user.name}</span>}
              </div>
              {visit.notes && (
                <p className='text-sm text-muted-foreground mt-1 truncate'>{visit.notes}</p>
              )}
            </div>
            {visit.status === 'PENDING' && onCancel && (
              <Button
                variant='ghost'
                size='sm'
                className='text-red-500 hover:text-red-600'
                onClick={async () => {
                  setCancellingId(visit.id)
                  await onCancel(visit.id)
                  setCancellingId(null)
                }}
                disabled={cancellingId === visit.id}
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
