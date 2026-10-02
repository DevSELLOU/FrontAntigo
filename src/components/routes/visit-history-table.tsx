'use client'

import { useState } from 'react'
import type { HistoryEntry } from '@/interfaces/history-entry.interface'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, CheckCircle2, XCircle, MapPin, ChevronDown, ChevronRight } from 'lucide-react'
import { formatDateOnly } from '@/utils/date.utils'

interface VisitHistoryTableProps {
  records: HistoryEntry[]
  loading?: boolean
}

const sourceLabels: Record<string, string> = {
  ROUTE: 'Rota',
  STANDALONE: 'Avulsa',
  ORDER: 'Pedido',
  QUOTE: 'Orçamento',
}

function HistoryCard({ record }: { record: HistoryEntry }) {
  return (
    <div className='flex items-start gap-4 rounded-xl border border-border bg-surface p-4'>
      <div className='shrink-0 mt-0.5'>
        {record.type === 'visit' ? (
          <CheckCircle2 className='h-5 w-5 text-success-foreground' />
        ) : (
          <XCircle className='h-5 w-5 text-text-muted' />
        )}
      </div>

      <div className='flex-1 min-w-0 space-y-1'>
        <div className='flex items-center gap-2 flex-wrap'>
          <p className='text-label text-text'>{record.customer?.fantasyName || `Cliente #${record.customerId}`}</p>
          {record.customer?.corporateName && (
            <span className='text-caption text-text-muted'>({record.customer.corporateName})</span>
          )}
          {record.type === 'visit' ? (
            <StatusBadge variant='success'>Visitado</StatusBadge>
          ) : (
            <StatusBadge variant='neutral'>Não visitado</StatusBadge>
          )}
          {record.isOutsideRoute && <StatusBadge variant='warning'>Fora da rota</StatusBadge>}
        </div>

        <p className='text-caption text-text-muted'>{new Date(record.timestamp).toLocaleString('pt-BR')}</p>

        <div className='flex flex-wrap items-center gap-3 text-caption text-text-muted'>
          {record.user && <span>Por: {record.user.name}</span>}
          {record.source && <StatusBadge variant='neutral'>{sourceLabels[record.source] || record.source}</StatusBadge>}
        </div>

        {record.notes && <p className='whitespace-pre-wrap break-words text-body text-text-body'>{record.notes}</p>}

        {record.latitude && record.longitude && (
          <p className='flex items-center gap-1 text-caption text-text-muted'>
            <MapPin className='h-3 w-3' />
            {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
          </p>
        )}

        {record.scheduledNextVisit && (
          <p className='text-caption text-[#008440]'>
            Próxima visita: {formatDateOnly(record.scheduledNextVisit)}
          </p>
        )}
      </div>
    </div>
  )
}

export function VisitHistoryTable({ records, loading }: VisitHistoryTableProps) {
  if (loading) {
    return (
      <div className='flex items-center justify-center h-32'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className='flex min-h-60 flex-col items-center justify-center rounded-2xl border border-border bg-surface py-10 text-text-muted'>
        <CalendarDays className='mb-2 h-10 w-10' />
        <p className='text-body'>Nenhum histórico de visita.</p>
      </div>
    )
  }

  // Group by route name (entries without a route go into "Avulsas")
  const grouped = new Map<string, HistoryEntry[]>()
  for (const record of records) {
    const key = record.routeName || 'Avulsas'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(record)
  }

  // Sort: named routes alphabetically, then "Avulsas" at the end
  const groupKeys = Array.from(grouped.keys()).sort((a, b) => {
    if (a === 'Avulsas') return 1
    if (b === 'Avulsas') return -1
    return a.localeCompare(b)
  })

  return (
    <div className='space-y-4'>
      {groupKeys.map((routeName) => (
        <RouteGroup
          key={routeName}
          routeName={routeName}
          entries={grouped.get(routeName)!}
        />
      ))}
    </div>
  )
}

function RouteGroup({ routeName, entries }: { routeName: string; entries: HistoryEntry[] }) {
  const [open, setOpen] = useState(true)
  const first = entries[0]
  const visitedCount = entries.filter((e) => e.type === 'visit').length
  const skippedCount = entries.filter((e) => e.type === 'skip').length

  return (
    <div className='overflow-hidden rounded-2xl border border-border shadow-sm'>
      {/* Route info card */}
      <div className='space-y-2 bg-surface p-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className='h-6 w-6 p-0'
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? `Ocultar registros de ${routeName}` : `Mostrar registros de ${routeName}`}
            >
              {open ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
            </Button>
            <span className='text-h3 text-text'>{routeName}</span>
            <StatusBadge variant='neutral'>
              {entries.length === 1 ? '1 registro' : `${entries.length} registros`}
            </StatusBadge>
          </div>
          <div className='flex items-center gap-2 text-caption'>
            <span className='font-semibold text-success-foreground'>{visitedCount} visitado(s)</span>
            <span className='text-text-muted'>|</span>
            <span className='font-semibold text-text-muted'>{skippedCount} não visitado(s)</span>
          </div>
        </div>

        {first?.routeDescription && <p className='ml-10 text-caption text-text-muted'>{first.routeDescription}</p>}

        <div className='ml-10 flex flex-wrap items-center gap-4 text-caption text-text-muted'>
          {first?.routeScheduledDate && (
            <span>Data: {formatDateOnly(first.routeScheduledDate)}</span>
          )}
          {first?.routeCustomerCount !== undefined && (
            <span>{first.routeCustomerCount} cliente(s)</span>
          )}
          {first?.routeUserCount !== undefined && (
            <span>{first.routeUserCount} vendedor(es)</span>
          )}
          {first?.routeCreatedBy && (
            <span>Criado por: {first.routeCreatedBy.name}</span>
          )}
        </div>
      </div>

      {/* Entries */}
      {open && (
        <div className='space-y-2 bg-surface-muted p-4 pt-2'>
          {entries.map((record) => (
            <HistoryCard key={`${record.type}-${record.id}`} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}
