'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Customer } from '@/interfaces/customer.interface'
import { formatCpfCnpj } from '@/utils/format/format-cpf-cnpj.util'
import { formatCurrency } from '@/utils/format/format-currency'
import { formatPhoneNumber } from '@/utils/format/format-phone.util'
import { formatPostalCode } from '@/utils/format/format-postal-code.util'
import { getCustomerCreditStatus, getCustomerCreditStatusClasses } from '@/utils/get-customer-credit-status'
import { CreditCard, Landmark, MapPin, Phone } from 'lucide-react'

interface CustomerDetailModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
}

/** Chip used for payment methods/conditions — brand tint, same shape as the status capsules. */
const chipClassName =
  'rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-caption font-semibold text-brand-700'

export function CustomerDetailModal({ isOpen, onClose, customer }: CustomerDetailModalProps) {
  if (!customer) return null

  const creditStatus = getCustomerCreditStatus(customer)
  const statusClass = getCustomerCreditStatusClasses(creditStatus.status)

  const creditLimit = formatCurrency(Number(customer.creditLimit))
  const creditUsed = formatCurrency(Number(customer.creditLimitUsed))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[92vh] overflow-hidden rounded-3xl border-border p-0 sm:max-w-2xl'>
        <DialogHeader className='border-b border-border bg-surface-muted/70 px-5 py-5 text-left sm:px-6'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='min-w-0'>
              <DialogTitle className='truncate text-xl font-bold text-text'>{customer.fantasyName}</DialogTitle>
              <p className='mt-1 text-caption text-text-muted'>
                {customer.corporateName} · CPF/CNPJ {formatCpfCnpj(customer.document)}
              </p>
            </div>
            <Badge className={`${statusClass} rounded-full shadow-none`}>{creditStatus.label}</Badge>
          </div>
        </DialogHeader>

        <div className='max-h-[calc(92vh-190px)] overflow-y-auto px-5 py-5 sm:px-6'>
          <div className='space-y-6'>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='rounded-2xl border border-border bg-surface p-4'>
                <p className='text-xs uppercase tracking-[0.08em] text-text-muted'>Limite de crédito</p>
                <p className='mt-1 text-lg font-bold tabular-nums text-text'>{creditLimit}</p>
              </div>
              <div className='rounded-2xl border border-border bg-surface p-4'>
                <p className='text-xs uppercase tracking-[0.08em] text-text-muted'>Crédito utilizado</p>
                <p className='mt-1 text-lg font-bold tabular-nums text-text'>{creditUsed}</p>
              </div>
            </div>

            {(customer.stateRegistration || customer.gln) && (
              <>
                <Separator />

                <section className='space-y-3'>
                  <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                    <Landmark className='h-5 w-5 text-[#008440]' />
                    Informações do cliente
                  </h3>

                  <div className='grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2'>
                    {customer.stateRegistration && (
                      <div>
                        <p className='text-xs text-text-muted'>Inscrição estadual</p>
                        <p className='mt-1 font-medium text-text-body'>{customer.stateRegistration}</p>
                      </div>
                    )}

                    {customer.gln && (
                      <div>
                        <p className='text-xs text-text-muted'>GLN</p>
                        <p className='mt-1 font-medium text-text-body'>{customer.gln}</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            <Separator />

            <section className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                <MapPin className='h-5 w-5 text-[#008440]' />
                Endereço
              </h3>

              <div className='grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2'>
                {customer.address && (
                  <div className='sm:col-span-2'>
                    <p className='text-xs text-text-muted'>Endereço</p>
                    <p className='mt-1 font-medium text-text-body'>{customer.address}</p>
                  </div>
                )}

                {customer.neighborhood && (
                  <div>
                    <p className='text-xs text-text-muted'>Bairro</p>
                    <p className='mt-1 font-medium text-text-body'>{customer.neighborhood}</p>
                  </div>
                )}

                {customer.cep && (
                  <div>
                    <p className='text-xs text-text-muted'>CEP</p>
                    <p className='mt-1 font-medium text-text-body'>{formatPostalCode(customer.cep)}</p>
                  </div>
                )}

                {customer.city && (
                  <div>
                    <p className='text-xs text-text-muted'>Cidade</p>
                    <p className='mt-1 font-medium text-text-body'>{customer.city}</p>
                  </div>
                )}

                {customer.UF && (
                  <div>
                    <p className='text-xs text-text-muted'>Estado</p>
                    <p className='mt-1 font-medium text-text-body'>{customer.UF}</p>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            <section className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                <Phone className='h-5 w-5 text-[#008440]' />
                Contato
              </h3>

              <div className='grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2'>
                {customer.phoneNumber && (
                  <div>
                    <p className='text-xs text-text-muted'>Telefone</p>
                    <p className='mt-1 font-medium text-text-body'>{formatPhoneNumber(customer.phoneNumber)}</p>
                  </div>
                )}

                {customer.email && (
                  <div>
                    <p className='text-xs text-text-muted'>E-mail</p>
                    <p className='mt-1 break-all font-medium text-text-body'>{customer.email}</p>
                  </div>
                )}

                {customer.url && (
                  <div>
                    <p className='text-xs text-text-muted'>Site</p>
                    <p className='mt-1 break-all font-medium text-text-body'>{customer.url}</p>
                  </div>
                )}
              </div>
            </section>

            {customer.paymentMethods && customer.paymentMethods.length > 0 && (
              <>
                <Separator />

                <section className='space-y-3'>
                  <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                    <CreditCard className='h-5 w-5 text-[#008440]' />
                    Formas de pagamento
                  </h3>

                  <div className='flex flex-wrap gap-2'>
                    {customer.paymentMethods.map(method => (
                      <span key={method.id} className={chipClassName}>
                        {method.name}
                      </span>
                    ))}
                  </div>
                </section>
              </>
            )}

            {customer.paymentConditions && customer.paymentConditions.length > 0 && (
              <>
                <Separator />

                <section className='space-y-3'>
                  <h3 className='text-lg font-semibold text-text'>Condições de pagamento</h3>

                  <div className='flex flex-wrap gap-2'>
                    {customer.paymentConditions.map(condition => (
                      <span key={condition.id} className={chipClassName}>
                        {condition.name}
                      </span>
                    ))}
                  </div>
                </section>
              </>
            )}

            {customer.observations && (
              <>
                <Separator />

                <section className='space-y-3'>
                  <h3 className='text-lg font-semibold text-text'>Observações</h3>
                  <p className='rounded-2xl bg-surface-muted p-4 text-body text-text-body'>{customer.observations}</p>
                </section>
              </>
            )}
          </div>
        </div>

        <div className='flex justify-end border-t border-border bg-surface-muted/70 px-5 py-4 sm:px-6'>
          <Button variant='outline' className='rounded-xl' onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
