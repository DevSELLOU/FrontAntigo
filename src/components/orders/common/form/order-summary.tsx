import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Customer } from '@/interfaces/customer.interface'
import { OrderItemDisplay } from '@/interfaces/order-item-display.interface'
import { SellerOption } from '@/utils/company-users.util'
import { formatCurrency } from '@/utils/format/format-currency'
import { getCustomerCreditStatus, getCustomerCreditStatusClasses } from '@/utils/get-customer-credit-status'
import { Receipt } from 'lucide-react'

interface OrderSummaryProps {
  form: any
  products: OrderItemDisplay[]
  selectedCustomer: Customer | null
  sellers?: SellerOption[]
}

/** Small caps label of a summary block. */
const blockLabelClassName = 'text-xs font-semibold uppercase tracking-[0.08em] text-text-muted'

export function OrderSummary({ form, products, selectedCustomer, sellers = [] }: OrderSummaryProps) {
  const observation = form.watch('observation')
  const discount = form.watch('discount')
  const paymentConditionId = form.watch('paymentConditionId')
  const paymentMethodId = form.watch('paymentMethodId')
  const responsibleUserIds = form.watch('responsibleUserIds') || []

  const calculateSubtotal = () => {
    return products.reduce((total, product) => total + product.price * product.quantity, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discountValue = Number.parseFloat(discount.toString()) || 0
    return subtotal - discountValue
  }

  const creditStatus = getCustomerCreditStatus(selectedCustomer)
  const statusClass = getCustomerCreditStatusClasses(creditStatus.status)

  return (
    <div className='space-y-6'>
      <Card className='overflow-hidden rounded-3xl border-border shadow-sm lg:sticky lg:top-6'>
        <CardHeader className='px-5 py-4 sm:px-6'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--glass-icon-bg)] text-[#008440]'>
              <Receipt className='h-4 w-4' />
            </div>

            <div className='min-w-0'>
              <CardTitle className='text-base font-bold text-text sm:text-lg'>Resumo do pedido</CardTitle>
              <p className='mt-0.5 text-xs leading-5 text-text-muted sm:text-sm'>
                Acompanha o pedido enquanto você monta os itens.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4 border-t border-border px-5 py-5 sm:px-6'>
          <div className='space-y-2'>
            <div className={blockLabelClassName}>Cliente</div>
            {selectedCustomer ? (
              <div className='space-y-1'>
                <div className='text-lg font-semibold text-text'>{selectedCustomer.fantasyName}</div>
                <Badge className={`rounded-full text-xs shadow-none ${statusClass}`}>{creditStatus.label}</Badge>
              </div>
            ) : (
              <div className='text-text-muted'>-</div>
            )}
          </div>

          <Separator />

          <div className='space-y-2'>
            <div className={blockLabelClassName}>Produtos</div>
            {products.length === 0 ? (
              <div className='text-sm italic text-text-muted'>Nenhum produto adicionado</div>
            ) : (
              products.map(product => (
                <div key={product.id} className='flex justify-between gap-3 text-sm text-text-body'>
                  <span>
                    {product.quantity}x{' '}
                    {product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
                  </span>
                  <span className='shrink-0 tabular-nums'>{formatCurrency(product.price * product.quantity)}</span>
                </div>
              ))
            )}
          </div>

          <Separator />

          <div className='space-y-2'>
            <div className={blockLabelClassName}>Vendedor responsável</div>
            <div className='flex flex-wrap gap-1'>
              {responsibleUserIds.length === 0 ? (
                <span className='text-text-muted'>-</span>
              ) : (
                responsibleUserIds.map((id: number) => (
                  <Badge key={id} variant='secondary' className='rounded-full'>
                    {sellers.find(seller => seller.id === id)?.name || 'Vendedor'}
                  </Badge>
                ))
              )}
            </div>
          </div>

          <Separator />

          <div className='flex justify-between text-sm'>
            <span className='text-text-muted'>Subtotal</span>
            <span className='tabular-nums text-text-body'>{formatCurrency(calculateSubtotal())}</span>
          </div>

          <div className='flex justify-between text-sm'>
            <span className='text-text-muted'>Desconto</span>
            <span className='tabular-nums text-text-body'>{formatCurrency(form.getValues('discount'))}</span>
          </div>

          {/* The order total is the single highlighted figure on this screen (DESIGN.md §7). */}
          <div className='flex items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3'>
            <span className='text-sm font-bold text-text'>Total</span>
            <span className='text-xl font-bold tabular-nums text-[#008440]'>{formatCurrency(calculateTotal())}</span>
          </div>

          <div className='space-y-2'>
            <div className={blockLabelClassName}>Condição de pagamento</div>
            <div className='text-text-body'>
              {paymentConditionId && selectedCustomer
                ? selectedCustomer.paymentConditions.find(p => p.id === Number(paymentConditionId))?.name
                : '-'}
            </div>
          </div>

          <div className='space-y-2'>
            <div className={blockLabelClassName}>Método de pagamento</div>
            <div className='text-text-body'>
              {paymentMethodId && selectedCustomer
                ? selectedCustomer.paymentMethods.find(p => p.id === Number(paymentMethodId))?.name
                : '-'}
            </div>
          </div>

          <Separator />
          <div className='space-y-2'>
            <div className={blockLabelClassName}>Observações</div>
            <div className='rounded-xl bg-surface-muted p-3 text-sm text-text-body'>
              {observation || <span className='italic text-text-muted'>Sem observações</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
