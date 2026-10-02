'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { Order } from '@/interfaces/order.interface'
import type { OrderWrapper } from '@/types/order-wrapper.type'
import { formatItemId } from '@/utils/format/format-item-id.util'

import { formatCurrency } from '@/utils/format/format-currency'
import { getOrderStatusBadgeStyle } from '@/utils/get-order-status-badge-style.util'
import { getOrderStatusText } from '@/utils/get-order-status-text.util'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import { Building, CreditCard, DollarSign, FileText, Timer, Copy, Scissors } from 'lucide-react'
import { OrderStatus } from '@/enums/order-status.enum'
import Image from 'next/image'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface ModalProps {
  open: boolean
  onClose: () => void
  order: Order
  orderWrapper: OrderWrapper
  onSplitClick?: (order: Order) => void
}

export function OrderViewModal({ open, onClose, order, orderWrapper, onSplitClick }: ModalProps) {
  const router = useRouter()
  const statusText = useMemo(() => getOrderStatusText(order?.status), [order?.status])
  const statusStyle = useMemo(() => getOrderStatusBadgeStyle(order?.status), [order?.status])

  const customer = useMemo(
    () => orderWrapper.customers.find(c => c.id === order.customerId),
    [orderWrapper.customers, order.customerId]
  )

  const paymentCondition = useMemo(
    () => customer?.paymentConditions.find(p => p.id === order.paymentConditionId),
    [customer?.paymentConditions, order.paymentConditionId]
  )

  const paymentMethod = useMemo(
    () => customer?.paymentMethods.find(p => p.id === order.paymentMethodId),
    [customer?.paymentMethods, order.paymentMethodId]
  )

  const responsible = useMemo(
    () => orderWrapper.users.find(u => u.id === order.responsibleUserId),
    [orderWrapper.users, order.responsibleUserId]
  )

  const responsibleUsers = useMemo(() => {
    if (order.responsibleUsers && order.responsibleUsers.length > 0) {
      return order.responsibleUsers
    }

    if (responsible) {
      return [
        {
          id: (responsible as any)?.user?.id ?? responsible.id,
          name: (responsible as any)?.user?.name ?? responsible.name
        }
      ]
    }

    return []
  }, [order.responsibleUsers, responsible])

  const hasAnyReference = useMemo(() => order.orderItems.some(item => item.product.reference), [order.orderItems])
  const hasAnySupplierCode = useMemo(() => order.orderItems.some(item => item.product.supplierCode), [order.orderItems])
  const hasAnyBarcode = useMemo(() => order.orderItems.some(item => item.product.barcode), [order.orderItems])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-h-[92vh] overflow-hidden rounded-3xl border-border p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b border-border bg-surface-muted/70 px-5 py-5 text-left sm:px-6'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <DialogTitle className='flex items-center gap-2 text-xl font-bold text-text'>
              Pedido #{formatItemId(order.id)}
              <Badge variant='secondary' className='rounded-full font-semibold shadow-none' style={statusStyle}>
                {statusText}
              </Badge>
            </DialogTitle>

            <div className='flex items-center gap-2'>
              {/* Duplicar is available from any status — repeat business is
                  usually a copy of an already delivered/invoiced order. */}
              <Button
                variant='outline'
                size='sm'
                className='rounded-xl'
                onClick={() => {
                  onClose()
                  router.push(`/company/${orderWrapper.companyId}/orders/duplicate/${order.id}`)
                }}
              >
                <Copy className='h-4 w-4 mr-2' />
                Duplicar
              </Button>
              {/* Dividir stays restricted to orders not yet committed downstream. */}
              {(order.status === OrderStatus.OnBudget || order.status === OrderStatus.InApproval) && (
                <Button
                  variant='outline'
                  size='sm'
                  className='rounded-xl'
                  onClick={() => {
                    if (onSplitClick) {
                      onSplitClick(order)
                    }
                    onClose()
                  }}
                >
                  <Scissors className='h-4 w-4 mr-2' />
                  Dividir
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className='max-h-[calc(92vh-110px)] overflow-y-auto px-5 py-5 sm:px-6'>
          <div className='space-y-6'>
            <section className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                <Building className='h-5 w-5 text-[#008440]' />
                Informações do cliente
              </h3>
              <div className='grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2'>
                <div>
                  <p className='text-xs text-text-muted'>Nome fantasia</p>
                  <p className='mt-1 font-medium text-text-body'>{customer?.fantasyName || '-'}</p>
                </div>
                <div>
                  <p className='text-xs text-text-muted'>Razão social</p>
                  <p className='mt-1 font-medium text-text-body'>{customer?.corporateName || '-'}</p>
                </div>
                <div>
                  <p className='text-xs text-text-muted'>CPF/CNPJ</p>
                  <p className='mt-1 font-medium text-text-body'>{customer?.document || '-'}</p>
                </div>
                <div>
                  <p className='text-xs text-text-muted'>Telefone</p>
                  <p className='mt-1 font-medium text-text-body'>{customer?.phoneNumber || '-'}</p>
                </div>
              </div>
            </section>

            <Separator />

            <section className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                <FileText className='h-5 w-5 text-[#008440]' />
                Detalhes do pedido
              </h3>
              <div className='grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2'>
                <div>
                  <p className='text-xs text-text-muted'>Condição de pagamento</p>
                  <p className='mt-1 font-medium text-text-body'>{paymentCondition?.name || '-'}</p>
                </div>
                <div>
                  <p className='text-xs text-text-muted'>Forma de pagamento</p>
                  <p className='mt-1 font-medium text-text-body'>{paymentMethod?.name || '-'}</p>
                </div>
                <div>
                  <p className='text-xs text-text-muted'>Responsável</p>
                  <div className='mt-1 flex flex-wrap gap-1'>
                    {responsibleUsers.length === 0 ? (
                      <p className='font-medium text-text-body'>-</p>
                    ) : (
                      responsibleUsers.map(user => (
                        <Badge key={user.id} variant='secondary' className='rounded-full font-normal'>
                          {user.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                {order.programmedDate && (
                  <div>
                    <p className='text-xs text-text-muted'>Data programada</p>
                    <p className='mt-1 font-medium text-text-body'>
                      {new Date(order.programmedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                <div>
                  <p className='text-xs text-text-muted'>Observações</p>
                  <p className='mt-1 font-medium text-text-body'>{order?.observation || '-'}</p>
                </div>
                <div>
                  <p className='text-xs text-text-muted'>Data de criação</p>
                  <p className='mt-1 font-medium text-text-body'>{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className='text-xs text-text-muted'>Última atualização</p>
                  <p className='mt-1 font-medium text-text-body'>{howTimeAgo(order.updatedAt)}</p>
                </div>
              </div>
            </section>

            <Separator />

            <section className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                <DollarSign className='h-5 w-5 text-[#008440]' />
                Informações de pagamento
              </h3>
              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='rounded-2xl border border-border bg-surface p-4'>
                  <p className='text-xs uppercase tracking-[0.08em] text-text-muted'>Valor total</p>
                  <p className='mt-1 text-lg font-bold tabular-nums text-[#008440]'>
                    {formatCurrency(order?.totalValue)}
                  </p>
                </div>
                <div className='rounded-2xl border border-border bg-surface p-4'>
                  <p className='text-xs uppercase tracking-[0.08em] text-text-muted'>Valor pago</p>
                  <p className='mt-1 text-lg font-bold tabular-nums text-text'>{formatCurrency(order?.amountPaid)}</p>
                </div>
              </div>
            </section>

            <Separator />

            <section className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                <CreditCard className='h-5 w-5 text-[#008440]' />
                Itens do pedido
              </h3>
              <div className='overflow-x-auto rounded-2xl border border-border'>
                <table className='w-full'>
                  <thead className='bg-surface-muted'>
                    <tr>
                      <th className='p-2 text-left text-eyebrow uppercase text-text-muted'>Produto</th>
                      {hasAnyReference && (
                        <th className='p-2 text-left text-eyebrow uppercase text-text-muted'>Referência</th>
                      )}
                      {hasAnySupplierCode && (
                        <th className='p-2 text-left text-eyebrow uppercase text-text-muted'>Cód. fornecedor</th>
                      )}
                      {hasAnyBarcode && (
                        <th className='p-2 text-left text-eyebrow uppercase text-text-muted'>Cód. barras</th>
                      )}
                      <th className='p-2 text-right text-eyebrow uppercase text-text-muted'>Qtd</th>
                      <th className='p-2 text-right text-eyebrow uppercase text-text-muted'>Preço</th>
                      <th className='p-2 text-right text-eyebrow uppercase text-text-muted'>Desc</th>
                      <th className='w-12 p-2 text-center text-eyebrow uppercase text-text-muted'>Foto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map(item => (
                      <tr key={item.productId} className='border-t border-border'>
                        <td className='p-2'>
                          <div className='max-w-[150px] truncate text-sm font-medium text-text'>{item.product.name}</div>
                        </td>
                        {hasAnyReference && (
                          <td className='p-2 text-xs text-text-muted'>{item.product.reference || ''}</td>
                        )}
                        {hasAnySupplierCode && (
                          <td className='p-2 text-xs text-text-muted'>{item.product.supplierCode || ''}</td>
                        )}
                        {hasAnyBarcode && <td className='p-2 text-xs text-text-muted'>{item.product.barcode || ''}</td>}
                        <td className='p-2 text-right text-xs tabular-nums text-text-body'>{item.quantity}</td>
                        <td className='p-2 text-right text-xs tabular-nums text-text-body'>
                          {formatCurrency(Number(item.product.price))}
                        </td>
                        <td className='p-2 text-right text-xs tabular-nums text-text-body'>
                          {formatCurrency(Number((item as any).discount) || 0)}
                        </td>
                        <td className='p-2'>
                          <div className='relative mx-auto h-8 w-8'>
                            {item?.product?.photos?.[0]?.url ? (
                              <Image
                                fill
                                alt={item.product.name || ''}
                                src={item.product.photos?.[0]?.url}
                                sizes='32px'
                                className='rounded-lg object-cover'
                                unoptimized={true}
                              />
                            ) : (
                              <div className='flex h-full w-full items-center justify-center rounded-lg border border-border'>
                                <span className='text-[10px] text-text-muted'>-</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <Separator />

            <section className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                <Timer className='h-5 w-5 text-[#008440]' />
                Status do pedido
              </h3>
              <div className='flex items-center gap-2 rounded-2xl bg-surface-muted p-4'>
                <Badge variant='secondary' className='rounded-full font-semibold shadow-none' style={statusStyle}>
                  {statusText}
                </Badge>
                <span className='text-caption text-text-muted'>Atualizado {howTimeAgo(order.updatedAt)}</span>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
