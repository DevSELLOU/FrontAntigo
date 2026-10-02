'use client'

import { useState } from 'react'
import { Customer } from '@/interfaces/customer.interface'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { Loader2, MapPin } from 'lucide-react'

interface CheckInModalProps {
  open: boolean
  onClose: () => void
  customer: Customer | null
  tripId: number
  companyId: number
  routeName?: string
  routeDescription?: string
  previousNotes?: string
  onCheckIn: (notes: string, scheduledNextVisit: string) => Promise<void>
}

export function CheckInModal({
  open,
  onClose,
  customer,
  routeName,
  routeDescription,
  previousNotes,
  onCheckIn
}: CheckInModalProps) {
  const [notes, setNotes] = useState('')
  const [scheduledNextVisit, setScheduledNextVisit] = useState<Date | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!scheduledNextVisit) return
    setSaving(true)
    try {
      await onCheckIn(notes, scheduledNextVisit.toISOString().split('T')[0])
      setNotes('')
      setScheduledNextVisit(undefined)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setNotes('')
    setScheduledNextVisit(undefined)
    onClose()
  }

  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar visita</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Route context */}
          {(routeName || routeDescription) && (
            <div className='rounded-xl border border-[var(--glass-border)] bg-[var(--glass-icon-bg)] p-3'>
              {routeName && <p className='text-sm font-semibold text-[#008440]'>{routeName}</p>}
              {routeDescription && <p className='mt-1 text-caption text-text-muted'>{routeDescription}</p>}
            </div>
          )}

          {/* Customer info */}
          <div className='rounded-xl border border-border bg-surface-muted p-3'>
            <p className='font-medium text-text'>{customer.fantasyName}</p>
            <p className='text-caption text-text-muted'>{customer.corporateName}</p>
            {customer.address && (
              <div className='mt-2 flex items-start gap-2 text-caption text-text-body'>
                <MapPin className='mt-0.5 h-4 w-4 shrink-0 text-text-muted' aria-hidden='true' />
                <span>
                  {customer.address}
                  {customer.neighborhood && ` - ${customer.neighborhood}`}
                  {customer.city && `, ${customer.city}`}
                  {customer.UF && ` - ${customer.UF}`}
                </span>
              </div>
            )}
          </div>

          {/* Previous notes */}
          {previousNotes && (
            <div className='rounded-xl border border-warning-border bg-warning p-3'>
              <p className='mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-warning-foreground'>
                Anotação anterior
              </p>
              <p className='text-caption text-warning-foreground'>{previousNotes}</p>
            </div>
          )}

          {/* Notes textarea */}
          <div className='space-y-2'>
            <label htmlFor='visit-notes' className='text-label text-text-body'>
              Observações da visita
            </label>
            <Textarea
              id='visit-notes'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Descreva como foi a visita, informações importantes...'
              rows={4}
              className='resize-none'
            />
          </div>

          {/* Scheduled next visit */}
          <div className='space-y-2'>
            <span className='block text-label text-text-body'>
              Agendar próxima visita <span className='text-danger-foreground'>*</span>
            </span>
            <DatePicker
              value={scheduledNextVisit}
              onChange={setScheduledNextVisit}
              placeholder='Selecione a data da próxima visita'
            />
            {!scheduledNextVisit && <p className='text-caption text-danger-foreground'>Campo obrigatório</p>}
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-2 border-t border-border pt-2'>
          <Button type='button' variant='outline' className='h-11' onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type='button'
            variant='default'
            className='h-11'
            onClick={handleSave}
            disabled={saving || !scheduledNextVisit}
          >
            {saving ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
                Salvando...
              </>
            ) : (
              'Salvar visita'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}