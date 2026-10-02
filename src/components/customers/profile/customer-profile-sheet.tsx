'use client'

import { fetchCustomerReferenceDataAction } from '@/actions/customer/fetch-customer-reference-data.action'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Customer } from '@/interfaces/customer.interface'
import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { Segment } from '@/interfaces/segment.interface'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CustomerProfileHeader } from './customer-profile-header'
import { CustomerProfileTabs } from './customer-profile-tabs'

interface CustomerProfileSheetProps {
  customer: Customer
  companyId: number
  open: boolean
  onClose: () => void
}

export function CustomerProfileSheet({ customer, companyId, open, onClose }: CustomerProfileSheetProps) {
  const [daysSinceLastOrder, setDaysSinceLastOrder] = useState<string | undefined>(undefined)
  const [segments, setSegments] = useState<Segment[]>([])
  const [paymentConditions, setPaymentConditions] = useState<PaymentCondition[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  useEffect(() => {
    if (!open || !customer) return

    const latestOrder = customer.orders?.[0]
    if (latestOrder) {
      setDaysSinceLastOrder(howTimeAgo(new Date(latestOrder.createdAt)))
    } else {
      setDaysSinceLastOrder(undefined)
    }

    const loadReferenceData = async () => {
      const referenceRes = await fetchCustomerReferenceDataAction(companyId)

      if ('segments' in referenceRes) {
        setSegments(referenceRes.segments)
        setPaymentConditions(referenceRes.paymentConditions)
        setPaymentMethods(referenceRes.paymentMethods)
      }
    }

    loadReferenceData()
  }, [open, customer, companyId])

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side='right' className='w-full sm:max-w-3xl p-0 flex flex-col'>
        <SheetHeader className='px-6 pt-6 pb-2'>
          <SheetTitle className='text-lg font-semibold leading-none tracking-tight'>
            Perfil do Cliente
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className='flex-1 px-6'>
          <div className='space-y-6 pb-6 pt-2'>
            <CustomerProfileHeader customer={customer} companyId={companyId} variant='plain' />
            {/* Usuários is hidden here on purpose. The sheet never loads `customerUsers`, so the
                tab always claimed "Nenhum usuário encontrado" regardless of reality, and its
                inline AdvancedFilter writes to the URL — meaning it rewrote the listing's own
                `filters` param from underneath the open drawer. Both are real bugs; the full
                profile page is where that tab actually works. */}
            <CustomerProfileTabs
              customer={customer}
              companyId={companyId}
              daysSinceLastOrder={daysSinceLastOrder}
              segments={segments}
              paymentConditions={paymentConditions}
              paymentMethods={paymentMethods}
              hiddenTabs={['usuarios']}
            />
          </div>
        </ScrollArea>

        <div className='border-t border-border px-6 py-4'>
          <Link
            href={`/company/${companyId}/customers/${customer.id}`}
            className='inline-flex items-center gap-2 text-label font-semibold text-primary hover:opacity-80 transition-opacity'
          >
            Abrir perfil completo
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
