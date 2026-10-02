'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { removeRouteAction } from '@/actions/route/remove-route.action'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { Route } from '@/interfaces/route.interface'

interface RemoveRouteModalProps {
  open: boolean
  onClose: () => void
  onRefresh?: () => void
  companyId: number
  route: Route
}

export function RemoveRouteModal({ open, onClose, onRefresh, companyId, route }: RemoveRouteModalProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    const result = await removeRouteAction(companyId, route.id)
    setIsDeleting(false)

    if (isApiErrorResponse(result)) {
      toast({ title: result.message, status: 'error' })
    } else {
      toast({ title: 'Rota excluída com sucesso', status: 'success' })
      onRefresh?.()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Rota</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <p>
            Tem certeza que deseja excluir a rota <strong>{route.name}</strong>?
          </p>
          <p className='text-sm text-muted-foreground mt-2'>
            Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className='flex justify-end gap-2'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button type='button' variant='destructive' onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}