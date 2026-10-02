'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

interface CompleteTripModalProps {
  open: boolean
  onClose: () => void
  tripId: number
  companyId: number
  onComplete: (status: 'COMPLETED' | 'INCOMPLETE', completionNote?: string) => Promise<void>
}

export function CompleteTripModal({
  open,
  onClose,
  onComplete
}: CompleteTripModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'COMPLETED' | 'INCOMPLETE' | null>(null)
  const [completionNote, setCompletionNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedStatus) return
    if (selectedStatus === 'INCOMPLETE' && !completionNote.trim()) return
    setSaving(true)
    try {
      await onComplete(selectedStatus, completionNote.trim() || undefined)
      setSelectedStatus(null)
      setCompletionNote('')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setSelectedStatus(null)
    setCompletionNote('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar viagem</DialogTitle>
          <DialogDescription>Selecione como a rota foi encerrada.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div
            role='radiogroup'
            aria-label='Resultado da viagem'
            className='grid grid-cols-1 gap-3 sm:grid-cols-2'
          >
            <Button
              type='button'
              role='radio'
              aria-checked={selectedStatus === 'COMPLETED'}
              variant={selectedStatus === 'COMPLETED' ? 'default' : 'outline'}
              className='flex h-24 flex-col items-center justify-center gap-2'
              onClick={() => setSelectedStatus('COMPLETED')}
            >
              <CheckCircle className='h-6 w-6' aria-hidden='true' />
              <span>Visitei todos</span>
            </Button>
            <Button
              type='button'
              role='radio'
              aria-checked={selectedStatus === 'INCOMPLETE'}
              variant={selectedStatus === 'INCOMPLETE' ? 'destructive' : 'outline'}
              className='flex h-24 flex-col items-center justify-center gap-2'
              onClick={() => setSelectedStatus('INCOMPLETE')}
            >
              <AlertTriangle className='h-6 w-6' aria-hidden='true' />
              <span>Não visitei todos</span>
            </Button>
          </div>

          {selectedStatus === 'INCOMPLETE' && (
            <div className='space-y-2'>
              <label htmlFor='completion-note' className='text-label text-text-body'>
                Motivo <span className='text-danger-foreground'>*</span>
              </label>
              <Textarea
                id='completion-note'
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                placeholder='Explique por que a rota não foi completada...'
                rows={3}
                className='resize-none'
              />
              {!completionNote.trim() && (
                <p className='text-caption text-danger-foreground'>
                  Campo obrigatório para finalização incompleta
                </p>
              )}
            </div>
          )}
        </div>

        <div className='flex justify-end gap-2 border-t border-border pt-2'>
          <Button type='button' variant='outline' className='h-11' onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type='button'
            variant='default'
            className='h-11'
            onClick={handleSave}
            disabled={saving || !selectedStatus || (selectedStatus === 'INCOMPLETE' && !completionNote.trim())}
          >
            {saving ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
                Finalizando...
              </>
            ) : (
              'Finalizar viagem'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
