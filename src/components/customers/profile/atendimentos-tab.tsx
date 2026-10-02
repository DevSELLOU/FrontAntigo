'use client'

import { fetchVisitRecordsByCustomerAction } from '@/actions/routes-visits/fetch-visit-records.action'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VisitRecord } from '@/interfaces/visit-record.interface'
import { useToast } from '@/hooks/use-toast'
import { formatDateTime } from '@/utils/date.utils'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { Clock, MapPin, MessageSquare, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Loading } from '../../loading'

interface AtendimentosTabProps {
  companyId: number
  customerId: number
}

export function AtendimentosTab({ companyId, customerId }: AtendimentosTabProps) {
  const { toast } = useToast()
  const [visitRecords, setVisitRecords] = useState<VisitRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVisitRecords = async () => {
      try {
        const response = await fetchVisitRecordsByCustomerAction(companyId, customerId)

        if (isApiErrorResponse(response)) {
          toast({ title: response.message || 'Erro ao buscar registros de visita', status: 'error' })
          return
        }

        setVisitRecords(response.data || [])
      } catch {
        toast({ title: 'Erro ao buscar registros de visita', status: 'error' })
      } finally {
        setIsLoading(false)
      }
    }

    loadVisitRecords()
  }, [companyId, customerId, toast])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-48'>
        <Loading />
      </div>
    )
  }

  if (visitRecords.length === 0) {
    return (
      <Card className='rounded-2xl border-border bg-surface'>
        <CardContent className='flex h-48 flex-col items-center justify-center text-text-muted'>
          <Clock className='mb-4 h-12 w-12 opacity-50' />
          <p className='text-h3'>Nenhum atendimento registrado</p>
          <p className='text-caption'>Os registros de visita aparecerão aqui quando houver.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <h3 className='text-h3 text-text'>Histórico de atendimentos</h3>
        <span className='text-caption text-text-muted tabular-nums'>
          {visitRecords.length} registro{visitRecords.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className='relative ml-3 space-y-6 border-l-2 border-border pl-6'>
        {visitRecords.map(record => (
          <div key={record.id} className='relative'>
            <div className='absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-surface bg-[#008440] shadow-sm' />
            <Card className='rounded-2xl border-border bg-surface'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center justify-between gap-3 text-label text-text'>
                  <span className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-text-muted' />
                    {formatDateTime(record.timestamp)}
                  </span>
                  <span className='text-caption font-normal text-text-muted'>
                    {howTimeAgo(new Date(record.timestamp))}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 pt-0'>
                {record.user && (
                  <div className='flex items-center gap-2 text-caption'>
                    <User className='h-4 w-4 text-text-muted' />
                    <span className='text-text-muted'>Atendente:</span>
                    <span className='font-semibold text-text-body'>{record.user.name}</span>
                  </div>
                )}

                {record.notes && (
                  <div className='flex items-start gap-2 text-caption'>
                    <MessageSquare className='mt-0.5 h-4 w-4 text-text-muted' />
                    <div>
                      <span className='text-text-muted'>Observações:</span>
                      <p className='mt-1 text-text-body'>{record.notes}</p>
                    </div>
                  </div>
                )}

                {record.latitude && record.longitude && (
                  <div className='flex items-center gap-2 text-caption text-text-muted'>
                    <MapPin className='h-4 w-4' />
                    <span className='tabular-nums'>
                      {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
