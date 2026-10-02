'use client'

import { getOrderSetupAction } from '@/actions/order-setup/order-setup.action'
import { createOrderAction } from '@/actions/order/create-order.action'
import { EmptyItems } from '@/components/shop-checkout/empty-items'
import { OrderSummaryModal } from '@/components/shop-checkout/order-summary-modal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { CustomError } from '@/errors/custom-error.error'
import { useShop } from '@/hooks/use-shop'
import { useShopAuth } from '@/hooks/use-shop-auth'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/utils/format/format-currency'
import { useCurrentHref } from '@/hooks/use-current-href'
import { buildShopSignInHref } from '@/utils/shop-return-to.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Loading } from '../loading'
import { CheckoutSkeleton } from './checkout-skeleton'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function ShopCheckoutPage() {
  const router = useRouter()
  const currentHref = useCurrentHref()
  const { toast } = useToast()
  const { state, dispatch, company } = useShop()
  const { user, isAuthenticated, accessToken } = useShopAuth()
  const companyId = company?.id

  const [isLoading, setIsLoading] = useState(true)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [selectedPaymentCondition, setSelectedPaymentCondition] = useState<string>('')
  const [isOrderModalSummaryOpen, setIsOrderModalSummaryOpen] = useState(false)
  const [orderObservation, setOrderObservation] = useState('')
  const [programmedDate, setProgrammedDate] = useState<Date | undefined>(undefined)
  const [isOrderPending, setIsOrderPending] = useState(false)
  const [orderSetup, setOrderSetup] = useState<{ minDays: number; maxDays: number } | null>(null)
  const [minDate, setMinDate] = useState<Date | undefined>(undefined)
  const [maxDate, setMaxDate] = useState<Date | undefined>(undefined)

  const customerConditions = useMemo(() => {
    return user?.customer?.paymentConditions || []
  }, [user])

  const customerMethods = useMemo(() => {
    return user?.customer?.paymentMethods || []
  }, [user])

  useEffect(() => {
    const initializePage = async () => {
      if (!isAuthenticated) {
        router.push(buildShopSignInHref(company?.fantasyName ?? '', currentHref))
        return
      }

      if (customerMethods.length > 0) {
        setSelectedPaymentMethod(String(customerMethods[0].id))
      }
      if (customerConditions.length > 0) {
        setSelectedPaymentCondition(String(customerConditions[0].id))
      }

      if (!companyId) return
      const response = await getOrderSetupAction(companyId, accessToken)
      if (isApiErrorResponse(response)) {
        if (response.statusCode === 401) {
          router.push(buildShopSignInHref(company?.fantasyName ?? '', currentHref))
          return
        }
      } else if (response.data) {
        const setup = response.data
        setOrderSetup(setup)
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const min = new Date(today)
        min.setDate(today.getDate() + setup.minDays)
        setMinDate(min)
        
        const max = new Date(today)
        max.setDate(today.getDate() + setup.maxDays)
        setMaxDate(max)
      }

      setIsLoading(false)
    }

    initializePage()
  }, [isAuthenticated, customerMethods, customerConditions, companyId, router])

  const subtotal = state?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOrderModalSummaryOpen(true)
  }

  const isCustomerActive = useMemo(() => {
    return user?.customer?.status === CustomerStatus.Active
  }, [user])

  const handleConfirmOrder = async () => {
    if (!isCustomerActive) {
      toast({
        title: 'Seu status de cliente não permite criar pedidos no momento.',
        status: 'error'
      })
      return
    }

    try {
      setIsOrderPending(true)

      const data = {
        discount: '0',
        customerId: Number(user?.customerId),
        paymentConditionId: Number(selectedPaymentCondition),
        paymentMethodId: Number(selectedPaymentMethod),
        observation: orderObservation.trim(),
        isBudget: false,
        programmedDate: programmedDate
          ? `${programmedDate.getFullYear()}-${String(programmedDate.getMonth() + 1).padStart(2, '0')}-${String(programmedDate.getDate()).padStart(2, '0')}`
          : undefined,
        items: state.items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      }

      // @ts-ignore
      const response = await createOrderAction(companyId, data, accessToken)

      if (isApiErrorResponse(response)) {
        if (response.statusCode === 401) {
          router.push(buildShopSignInHref(company?.fantasyName ?? '', currentHref))
          return
        }
        throw new CustomError(response.message)
      }

      setIsOrderModalSummaryOpen(false)
      router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}/checkout/success`)

      setTimeout(() => {
        clearCheckoutData()
      }, 500)
    } catch (error: any) {
      const title =
        error?.message ??
        'Erro desconhecido ao criar criar pedido. Verifique sua conexão ou tente novamente mais tarde.'

      return toast({
        title,
        status: 'error'
      })
    } finally {
      setIsOrderPending(false)
    }
  }

  const clearCheckoutData = () => {
    dispatch({ type: 'CLEAR_CART', clearLocalStorage: true })
    setOrderObservation('')
    setSelectedPaymentCondition('')
    setSelectedPaymentMethod('')
    setProgrammedDate(undefined)
  }

  if (isLoading) return <CheckoutSkeleton />

  if (state.items.length === 0) return <EmptyItems router={router} fantasyName={company?.fantasyName ?? ''} />

  return (
    <>
      <div className='w-full p-5 lg:px-20'>
        <Button variant='outline' className='mb-8' onClick={() => router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}`)}>
          <ChevronLeft className='mr-2 h-4 w-4' />
          Continuar comprando
        </Button>

        <div className='flex flex-col gap-8 lg:grid lg:grid-cols-2'>
          <div className='order-2 lg:order-1 lg:border-r lg:pr-8'>
            <h2 className='mb-4 text-xl font-semibold sm:text-2xl'>Resumo do Pedido</h2>
            {/* The old ternary read `length >= 2 ? '300px' : length >= 4 ? '500px' : '200px'` — the
                second branch is unreachable, so a ten-item order was pinned to 300px. On a phone a
                nested scroll area inside a page that already scrolls is the wrong trade anyway, so
                the cap now only applies from `lg` up. */}
            <div className='divide-y pr-4 lg:max-h-[420px] lg:overflow-y-auto'>
              {state.items.map(item => (
                <div key={item.id} className='flex gap-4 py-4'>
                  <div className='relative w-20 h-20'>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes='80px' className='object-cover rounded-md' />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center border rounded-md px-1'>
                        <span className='text-muted-foreground text-center text-xs'>Sem Imagem</span>
                      </div>
                    )}
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-medium'>{item.name}</h3>
                    <p className='text-sm text-muted-foreground'>Quantidade: {item.quantity}</p>
                    <p className='font-medium'>{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className='border-t mt-4 pt-4 space-y-2'>
              <div className='flex justify-between text-lg font-semibold'>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>
          </div>

          <div className='order-1 lg:order-2'>
            <h1 className='mb-4 text-xl font-bold sm:text-2xl'>Confirmar Pedido</h1>
            
            {!isCustomerActive && (
              <Alert variant='destructive' className='mb-4'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Acesso Restrito</AlertTitle>
                <AlertDescription>
                  Seu status de cliente não permite criar pedidos no momento. Entre em contato com o administrador.
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='rounded-lg border p-4 bg-muted/50'>
                <p className='text-sm text-muted-foreground'>
                  Você está autenticado como{' '}
                  <span className='font-medium text-foreground'>
                    {user?.name} {`<${user?.email}>`}
                  </span>
                </p>
                <p className='text-sm text-muted-foreground mt-1'>
                  Entraremos em contato com você através do e-mail e/ou telefone cadastrado.
                </p>
              </div>

              <Card className='p-4'>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-lg font-medium mb-3'>Método de Pagamento</h3>
                    <RadioGroup
                      value={selectedPaymentMethod}
                      onValueChange={setSelectedPaymentMethod}
                      className='space-y-2'
                    >
                      {customerMethods?.length ? (
                        customerMethods.map(method => (
                          <div key={method.id} className='flex items-center space-x-2'>
                            <RadioGroupItem value={String(method.id)} id={`method-${method.id}`} />
                            <Label htmlFor={`method-${method.id}`} className='flex-1'>
                              <span className='font-medium'>{method.name}</span>
                              {method.description && (
                                <p className='text-sm text-muted-foreground'>{method.description}</p>
                              )}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className='text-sm text-muted-foreground'>Nenhum método de pagamento disponível</p>
                      )}
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className='text-lg font-medium mb-3'>Condição de Pagamento</h3>
                    <RadioGroup
                      value={selectedPaymentCondition}
                      onValueChange={setSelectedPaymentCondition}
                      className='space-y-2'
                    >
                      {customerConditions?.length ? (
                        customerConditions?.map(condition => (
                          <div key={condition.id} className='flex items-center space-x-2'>
                            <RadioGroupItem value={String(condition.id)} id={`condition-${condition.id}`} />
                            <Label htmlFor={`condition-${condition.id}`} className='flex-1'>
                              <span className='font-medium'>{condition.name}</span>
                              {condition.description && (
                                <p className='text-sm text-muted-foreground'>{condition.description}</p>
                              )}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className='text-sm text-muted-foreground'>Nenhuma condição de pagamento disponível</p>
                      )}
                    </RadioGroup>
                  </div>
                </div>
              </Card>

              <div className='rounded-lg border p-4'>
                <h3 className='text-lg font-medium mb-3'>Observações do Pedido</h3>
                <Textarea
                  placeholder='Adicione uma observação ao seu pedido (opcional)'
                  value={orderObservation}
                  onChange={e => setOrderObservation(e.target.value)}
                  className='resize-none'
                  rows={3}
                />
              </div>

              <div className='rounded-lg border p-4'>
                <h3 className='text-lg font-medium mb-3'>Data de Entrega Programada (opcional)</h3>
                <DatePicker
                  value={programmedDate}
                  onChange={setProgrammedDate}
                  placeholder='Selecione uma data para entrega programada'
                  fromDate={minDate}
                  toDate={maxDate}
                />
                {orderSetup ? (
                  <p className='text-sm text-muted-foreground mt-2'>
                    Selecione uma data entre {orderSetup.minDays} e {orderSetup.maxDays} dias a partir de hoje
                  </p>
                ) : (
                  <p className='text-sm text-muted-foreground mt-2'>
                    Selecione uma data futura para receber seu pedido em uma data específica
                  </p>
                )}
              </div>

              {/* Sticky only below `lg`: on a phone this button sat at the end of ~2000px of
                  scrolling (summary, payment, conditions, notes, date picker) and was the single
                  action the whole screen exists for. */}
              <div className='sticky bottom-0 -mx-5 border-t bg-surface px-5 py-4 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0'>
                <Button
                  type='submit'
                  className='min-h-12 w-full'
                  size='lg'
                  disabled={!selectedPaymentMethod || !selectedPaymentCondition || isOrderPending || !isCustomerActive}
                >
                  Completar Pedido
                  {isOrderPending && <Loading />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isOrderModalSummaryOpen ? (
        <OrderSummaryModal
          isOpen={isOrderModalSummaryOpen}
          onClose={() => setIsOrderModalSummaryOpen(false)}
          onConfirm={handleConfirmOrder}
          isOrderPending={isOrderPending}
          orderDetails={{
            items: state.items,
            paymentMethod: customerMethods.find(m => String(m.id) === selectedPaymentMethod)?.name || '',
            paymentCondition: customerConditions.find(c => String(c.id) === selectedPaymentCondition)?.name || '',
            observation: orderObservation.trim() || undefined,
            subtotal,
            customer: {
              name: user?.name || '',
              email: user?.email || ''
            }
          }}
        />
      ) : null}
    </>
  )
}
