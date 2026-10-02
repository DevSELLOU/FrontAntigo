'use client'

import { fetchCustomerReferenceDataAction } from '@/actions/customer/fetch-customer-reference-data.action'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { Segment } from '@/interfaces/segment.interface'
import { User } from '@/interfaces/user.interface'
import { CustomerWrapper } from '@/types/customer-wrapper.type'
import { useCallback, useEffect, useState } from 'react'
import { Loading } from '../../loading'
import { CreateCustomerModal } from './create-customer-modal'

interface CreateCustomerModalLoaderProps {
  open: boolean
  onClose: () => void
  companyId: number
  /** Already loaded by the listing itself, so it renders the segment name on every card/row. */
  segments: Segment[]
}

interface FormData {
  paymentConditions: PaymentCondition[]
  paymentMethods: PaymentMethod[]
  users: User[]
  segments: Segment[]
}

/**
 * Loads the create form's reference data when the modal opens, instead of on every listing render.
 *
 * The listing used to fetch payment conditions, payment methods and company users on every page
 * load purely to hand them to this modal — three requests per visit for a form most visits never
 * open. Segments are the exception and stay on the page: the cards and the table print the
 * customer's segment name, so they are needed whether the modal opens or not.
 *
 * CreateCustomerModal only mounts once the data is in, so its react-hook-form defaults are built
 * from complete option lists rather than empty ones.
 */
export function CreateCustomerModalLoader({ open, onClose, companyId, segments }: CreateCustomerModalLoaderProps) {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [hasError, setHasError] = useState(false)

  const load = useCallback(async () => {
    setHasError(false)

    const response = await fetchCustomerReferenceDataAction(companyId, { includeUsers: true })

    if (!('segments' in response)) {
      setHasError(true)
      return
    }

    setFormData({
      // The listing's own segments are the same list; preferring the freshly fetched one keeps
      // a long-open tab from offering stale options.
      segments: response.segments?.length ? response.segments : segments,
      paymentConditions: response.paymentConditions,
      paymentMethods: response.paymentMethods,
      users: response.users
    })
  }, [companyId, segments])

  useEffect(() => {
    if (!open || formData) return
    load()
  }, [open, formData, load])

  if (!open) return null

  if (formData) {
    const customerWrapper: CustomerWrapper = {
      companyId,
      customers: [],
      segments: formData.segments,
      paymentConditions: formData.paymentConditions,
      paymentMethods: formData.paymentMethods,
      users: formData.users
    }

    return <CreateCustomerModal open onClose={onClose} customerWrapper={customerWrapper} />
  }

  return (
    <Dialog open onOpenChange={openState => !openState && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription>
            {hasError
              ? 'Não foi possível carregar segmentos, condições e métodos de pagamento.'
              : 'Carregando segmentos, condições e métodos de pagamento...'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center justify-center py-6'>
          {hasError ? (
            <Button type='button' onClick={load}>
              Tentar novamente
            </Button>
          ) : (
            <Loading />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
