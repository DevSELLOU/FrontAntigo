'use client'

import { useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

import { Bell } from 'lucide-react'

import { fetchMyDayVisitsAction } from '@/actions/scheduled-visit/fetch-scheduled-visits.action'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/hooks/use-auth'

import type { ScheduledVisit } from '@/interfaces/scheduled-visit.interface'
import { localDateKey } from '@/utils/local-date.util'

export function DailyAgendaBell() {
  const { user, activeCompanyId, role } = useAuth()
  const userId = user?.id
  const pathname = usePathname()
  const companyId = Number(pathname.match(/\/company\/(\d+)/)?.[1] || activeCompanyId)
  const [open, setOpen] = useState(false)
  const [revision, setRevision] = useState(0)
  const [visits, setVisits] = useState<ScheduledVisit[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!open || !userId || !companyId) return
    let current = true

    setState('loading')
    setVisits([])
    fetchMyDayVisitsAction(companyId, localDateKey())
      .then(result => {
        if (!current) return
        if ('data' in result && Array.isArray(result.data)) {
          setVisits(result.data)
          setState('ready')
        } else setState('error')
      })
      .catch(() => {
        if (current) setState('error')
      })

    return () => {
      current = false
    }
  }, [open, companyId, userId, revision])

  useEffect(() => {
    if (!open) return
    const refresh = () => setRevision(value => value + 1)
    const timer = window.setInterval(refresh, 60_000)

    window.addEventListener('focus', refresh)
    window.addEventListener('scheduled-visits-changed', refresh)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('scheduled-visits-changed', refresh)
    }
  }, [open])

  if (!user || !companyId || role === 'CUSTOMER_CLIENT') return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label='Compromissos de hoje'
          className='relative flex h-9 w-9 items-center justify-center rounded-md text-text-body hover:bg-surface-muted'
        >
          <Bell size={20} />
        </button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-[min(360px,calc(100vw-2rem))] bg-surface text-text'>
        <h2 className='mb-3 font-semibold'>Compromissos de hoje</h2>
        <div aria-live='polite'>
          {state === 'loading' && <p>Carregando compromissos...</p>}
          {state === 'error' && (
            <div>
              <p>Não foi possível carregar os compromissos.</p>
              <button className='mt-2 underline' onClick={() => setRevision(value => value + 1)}>
                Tentar novamente
              </button>
            </div>
          )}
          {state === 'ready' && visits.length === 0 && <p>Não há compromissos hoje.</p>}
          {state === 'ready' && visits.length > 0 && (
            <ul className='max-h-80 overflow-y-auto divide-y divide-border'>
              {visits.map(visit => (
                <li key={visit.id} className='py-3'>
                  <p className='font-medium'>
                    {visit.scheduledTime?.slice(0, 5) || 'Sem horário'} ·{' '}
                    {visit.customer?.fantasyName || visit.customer?.corporateName || `Cliente #${visit.customerId}`}
                  </p>
                  <p className='text-sm text-text-muted'>Visita #{visit.id}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
