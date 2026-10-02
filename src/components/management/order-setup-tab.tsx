'use client'

import { createOrderSetupAction, updateOrderSetupAction } from '@/actions/order-setup/order-setup.action'
import { ManagementShell } from '@/components/management/management-shell'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { OrderSetup } from '@/interfaces/order-setup.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { CalendarRange } from 'lucide-react'
import { useState } from 'react'

interface OrderSetupTabProps {
  orderSetup: OrderSetup | null
  companyId: number
  isAdministrator: boolean
}

export function OrderSetupTab({ orderSetup, companyId, isAdministrator }: OrderSetupTabProps) {
  const { toast } = useToast()
  const [minDays, setMinDays] = useState<number>(orderSetup?.minDays ?? 1)
  const [maxDays, setMaxDays] = useState<number>(orderSetup?.maxDays ?? 30)
  const [orderSetupId, setOrderSetupId] = useState<number | null>(orderSetup?.id ?? null)
  const [isSaving, setIsSaving] = useState(false)

  // The old screen let a minimum above the maximum be saved, which yields a scheduling window that
  // can never be satisfied. Cheap to catch here, before it reaches the order form.
  const isRangeInvalid = minDays > maxDays

  const handleSave = async () => {
    if (isRangeInvalid) return

    try {
      setIsSaving(true)

      const payload = { minDays, maxDays }

      const response = orderSetupId
        ? await updateOrderSetupAction(Number(companyId), orderSetupId, payload)
        : await createOrderSetupAction(Number(companyId), payload)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      if (response?.data?.id) {
        setOrderSetupId(response.data.id)
      }

      toast({
        title: 'Configurações salvas com sucesso',
        status: 'success'
      })
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao salvar configurações'

      toast({
        title: message,
        status: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ManagementShell
      tab='pedidos'
      isAdministrator={isAdministrator}
      companyId={companyId}
      header={
        <ListingPageHeader
          card
          icon={<CalendarRange className='h-5 w-5' />}
          eyebrow='Gerenciamento'
          title='Prazos de pedido'
          description='Defina a janela de dias permitida ao agendar um pedido programado.'
          showViewSelector={false}
        />
      }
    >
      <Card className='max-w-2xl'>
        <CardHeader>
          <CardTitle>Pedidos programados</CardTitle>
          <CardDescription>
            O representante só consegue agendar a entrega dentro desta janela, contada a partir da data do pedido.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid gap-6 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='min-days'>Mínimo de dias</Label>
              <Input
                id='min-days'
                type='number'
                min={1}
                value={minDays}
                onChange={event => setMinDays(Number(event.target.value))}
                placeholder='Ex: 1'
                aria-invalid={isRangeInvalid}
                aria-describedby={isRangeInvalid ? 'order-setup-range-error' : undefined}
              />
              <p className='text-caption text-text-muted'>Antecedência mínima para agendar um pedido.</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='max-days'>Máximo de dias</Label>
              <Input
                id='max-days'
                type='number'
                min={1}
                max={365}
                value={maxDays}
                onChange={event => setMaxDays(Number(event.target.value))}
                placeholder='Ex: 30'
                aria-invalid={isRangeInvalid}
                aria-describedby={isRangeInvalid ? 'order-setup-range-error' : undefined}
              />
              <p className='text-caption text-text-muted'>Até quando o pedido pode ser agendado.</p>
            </div>
          </div>

          {isRangeInvalid && (
            <p id='order-setup-range-error' role='alert' className='text-caption text-danger-foreground'>
              O mínimo de dias precisa ser menor ou igual ao máximo.
            </p>
          )}

          <div className='flex justify-end'>
            <Button onClick={handleSave} disabled={isSaving || isRangeInvalid}>
              {isSaving ? 'Salvando...' : 'Salvar configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </ManagementShell>
  )
}
