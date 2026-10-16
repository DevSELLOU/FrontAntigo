'use client'

import { useEffect, useState } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { searchCustomersAction } from '@/actions/customer/search-customers.action'
import { fetchUsersAction } from '@/actions/user/fetch-users.action'
import { createScheduledVisitAction } from '@/actions/scheduled-visit/create-scheduled-visit.action'
import { localDateKey } from '@/utils/local-date.util'
import type { Customer } from '@/interfaces/customer.interface'

export function CreateVisitDialog({
  open,
  onClose,
  companyId,
  onCreated
}: {
  open: boolean
  onClose: () => void
  companyId: number
  onCreated: () => void
}) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<{ id: number; name: string }[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [userId, setUserId] = useState('')
  const [date, setDate] = useState(localDateKey())
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setCustomerId('')
    setUserId('')
    setDate(localDateKey())
    setTime('')
    setNotes('')
    setCustomerSearch('')
    setUserSearch('')
    setError('')
  }, [open])

  useEffect(() => {
    if (!open) return
    let current = true

    setLoading(true)

    const timer = window.setTimeout(async () => {
      try {
        const [customerResult, userResult] = await Promise.all([
          searchCustomersAction(companyId, encodeURIComponent(customerSearch)),
          fetchUsersAction(companyId, userSearch)
        ])

        if (!current) return

        if (!('data' in customerResult) || !('data' in userResult)) {
          setError('Não foi possível carregar clientes e responsáveis.')
          setCustomers([])
          setUsers([])
        } else {
          setCustomers(customerResult.data || [])
          setUsers(
            (userResult.data || []).filter(user => user.role !== 'CUSTOMER_CLIENT' && user.status !== 'INACTIVE')
          )
          setError('')
        }
      } catch {
        if (current) setError('Não foi possível carregar clientes e responsáveis.')
      } finally {
        if (current) setLoading(false)
      }
    }, 250)

    return () => {
      current = false
      window.clearTimeout(timer)
    }
  }, [open, companyId, customerSearch, userSearch])

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value && !saving) onClose()
      }}
    >
      <DialogContent className='max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Nova visita avulsa</DialogTitle>
        </DialogHeader>
        <form
          className='space-y-4'
          onSubmit={async event => {
            event.preventDefault()
            if (saving) return
            setSaving(true)
            setError('')

            try {
              const result = await createScheduledVisitAction(companyId, {
                customerId: Number(customerId),
                userId: Number(userId),
                scheduledDate: date,
                scheduledTime: time,
                notes: notes.trim() || undefined
              })

              if (!('data' in result)) {
                setError(result.message)

                return
              }

              window.dispatchEvent(new Event('scheduled-visits-changed'))
              onCreated()
              onClose()
            } catch {
              setError('Não foi possível criar a visita. Tente novamente.')
            } finally {
              setSaving(false)
            }
          }}
        >
          <div className='space-y-2'>
            <Label htmlFor='visit-customer-search'>Buscar cliente</Label>
            <Input
              id='visit-customer-search'
              value={customerSearch}
              onChange={event => {
                setCustomerSearch(event.target.value)
                setCustomerId('')
              }}
            />
            <Label htmlFor='visit-customer'>Cliente</Label>
            <select
              id='visit-customer'
              required
              value={customerId}
              onChange={event => setCustomerId(event.target.value)}
              className='h-10 w-full rounded-md border border-input bg-background px-3'
            >
              <option value=''>Selecione o cliente</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.fantasyName || customer.corporateName}
                </option>
              ))}
            </select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='visit-user-search'>Buscar responsável</Label>
            <Input
              id='visit-user-search'
              value={userSearch}
              onChange={event => {
                setUserSearch(event.target.value)
                setUserId('')
              }}
            />
            <Label htmlFor='visit-user'>Vendedor/representante responsável</Label>
            <select
              id='visit-user'
              required
              value={userId}
              onChange={event => setUserId(event.target.value)}
              className='h-10 w-full rounded-md border border-input bg-background px-3'
            >
              <option value=''>Selecione o responsável</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='visit-date'>Data</Label>
              <Input
                id='visit-date'
                type='date'
                required
                value={date}
                onChange={event => setDate(event.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='visit-time'>Horário</Label>
              <Input
                id='visit-time'
                type='time'
                required
                value={time}
                onChange={event => setTime(event.target.value)}
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='visit-notes'>Observação</Label>
            <Textarea id='visit-notes' value={notes} onChange={event => setNotes(event.target.value)} />
          </div>
          {loading && <p role='status'>Carregando seletores...</p>}
          {error && (
            <p role='alert' className='text-red-600'>
              {error}
            </p>
          )}
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' disabled={saving} onClick={onClose}>
              Cancelar
            </Button>
            <Button type='submit' className='bg-[#008440] text-white hover:bg-[#006b34]' disabled={saving || loading}>
              {saving ? 'Salvando...' : 'Agendar visita'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
