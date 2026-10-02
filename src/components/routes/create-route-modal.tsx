'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createRouteAction } from '@/actions/route/create-route.action'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'

interface CreateRouteModalProps {
  open: boolean
  onClose: () => void
  companyId: number
}

export function CreateRouteModal({ open, onClose, companyId }: CreateRouteModalProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({ title: 'O nome da rota é obrigatório', status: 'error' })
      return
    }

    setIsLoading(true)
    const result = await createRouteAction(companyId, {
      name: name.trim(),
      description: description.trim()
    })
    setIsLoading(false)

    if (isApiErrorResponse(result)) {
      toast({ title: result.message, status: 'error' })
    } else {
      toast({ title: 'Rota criada com sucesso', status: 'success' })
      onClose()
      setName('')
      setDescription('')
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setName('')
      setDescription('')
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Nova Rota</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Nome da Rota</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Ex: Rota Centro'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Descrição (opcional)</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Descrição da rota...'
              rows={2}
            />
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Rota'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}