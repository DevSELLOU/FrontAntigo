'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { clientFetch } from '@/utils/client-fetch.util'
import { CommonResponse } from '@/interfaces/common-response.interface'
import type { UserGoal } from '@/interfaces/user-goal.interface'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'

interface RemoveUserGoalModalProps {
  goal: UserGoal
  open: boolean
  onClose: () => void
  companyId: number
}

export function RemoveUserGoalModal({ goal, open, onClose, companyId }: RemoveUserGoalModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await clientFetch<CommonResponse<void>>(
        `/company/${companyId}/user-goals/${goal.id}`,
        { method: 'DELETE' },
        { handleTokenExpired: signOut }
      )

      if (isApiErrorResponse(response)) {
        alert(response.message || 'Erro ao excluir meta')
        return
      }

      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error removing goal:', error)
      alert('Erro ao excluir meta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Meta</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a meta de {goal.user?.name}? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex justify-end gap-2 pt-4'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button type='submit' variant='destructive' disabled={isLoading}>
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}