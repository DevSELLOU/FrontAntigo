'use client'

import { addCustomerPaymentCondition } from '@/actions/customer-payment-condition/add-payment-condition.action'
import { removeCustomerPaymentCondition } from '@/actions/customer-payment-condition/remove-payment-condition.action'
import { addCustomerPaymentMethod } from '@/actions/customer-payment-method/add-payment-method.action'
import { removeCustomerPaymentMethod } from '@/actions/customer-payment-method/remove-payment-method.action'
import { updateCustomerAction } from '@/actions/customer/update-customer.action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import InputCurrency from '@/components/ui/input-currency'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CountryState } from '@/enums/country-state.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { CustomerType } from '@/enums/customer-type.enum'
import { CUSTOMER_TYPE_OPTIONS } from '@/utils/customers/customer-type.util'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { Customer } from '@/interfaces/customer.interface'
import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { Segment } from '@/interfaces/segment.interface'
import { formatCpfCnpj } from '@/utils/format/format-cpf-cnpj.util'
import { formatPhoneNumber } from '@/utils/format/format-phone.util'
import { formatPostalCode } from '@/utils/format/format-postal-code.util'
import { getCountryStateText } from '@/utils/get-country-state-text.util'
import { getCustomerStatusText } from '@/utils/get-customer-status-text.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { processCustomerPaymentChanges } from '@/utils/process-customer-payment-changes.util'
import { removeNonNumericChars } from '@/utils/remove-non-numeric-chars.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { TagsInput } from './tags-input'

const DadosTabSchema = z.object({
  corporateName: z.string().min(3, { message: 'Razão Social é obrigatório' }),
  fantasyName: z.string().min(3, { message: 'Nome Fantasia é obrigatório' }),
  document: z.string().min(1, { message: 'CPF/CNPJ é obrigatório' }),
  stateRegistration: z.string().optional(),
  gln: z.string().optional().nullable(),
  subSegmentId: z.string().min(1, { message: 'O segmento é obrigatório' }),
  status: z.nativeEnum(CustomerStatus).optional(),
  customerType: z.nativeEnum(CustomerType).optional().nullable(),
  creditLimit: z.number().positive({ message: 'Limite de Crédito é obrigatório' }),
  paymentMethodsIds: z.array(z.number(), { required_error: 'Métodos de pagamento são obrigatórios' }),
  paymentConditionIds: z.array(z.number(), { required_error: 'Condições de pagamento são obrigatórias' }),
  address: z.string().min(3, { message: 'Endereço é obrigatório' }),
  neighborhood: z.string().min(3, { message: 'Bairro é obrigatório' }),
  city: z.string().min(3, { message: 'Cidade é obrigatório' }),
  UF: z.nativeEnum(CountryState),
  cep: z.string().min(8, { message: 'CEP é obrigatório' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  phoneNumber: z.string().min(3, { message: 'Telefone é obrigatório' }),
  url: z.string().optional(),
  observations: z.string().optional(),
  tags: z.array(z.string()).optional()
})

type DadosTabValues = z.infer<typeof DadosTabSchema>

interface DadosTabProps {
  customer: Customer
  companyId: number
  daysSinceLastOrder?: string
  segments: Segment[]
  paymentConditions: PaymentCondition[]
  paymentMethods: PaymentMethod[]
}

export function DadosTab({
  customer,
  companyId,
  daysSinceLastOrder,
  segments,
  paymentConditions,
  paymentMethods
}: DadosTabProps) {
  const { toast } = useToast()

  const currentPaymentConditionIds = useMemo(
    () => customer.paymentConditions?.map(pc => pc.id),
    [customer.paymentConditions]
  )

  const currentPaymentMethodIds = useMemo(
    () => customer.paymentMethods?.map(pm => pm.id),
    [customer.paymentMethods]
  )

  const form = useForm<DadosTabValues>({
    resolver: zodResolver(DadosTabSchema),
    defaultValues: {
      corporateName: customer.corporateName || '',
      fantasyName: customer.fantasyName || '',
      document: customer.document || '',
      stateRegistration: customer.stateRegistration || '',
      gln: customer.gln || '',
      subSegmentId: String(customer.subSegmentId) || '',
      status: customer.status || CustomerStatus.Active,
      customerType: customer.customerType,
      creditLimit: Number(customer.creditLimit) || 0,
      paymentMethodsIds: currentPaymentMethodIds || [],
      paymentConditionIds: currentPaymentConditionIds || [],
      address: customer.address || '',
      neighborhood: customer.neighborhood || '',
      city: customer.city || '',
      UF: customer.UF || CountryState.AC,
      cep: customer.cep || '',
      email: customer.email || '',
      phoneNumber: customer.phoneNumber || '',
      url: customer.url || '',
      observations: customer.observations || '',
      tags: customer.tags || []
    }
  })

  const paymentConditionOptions = paymentConditions.map(pc => ({
    value: String(pc.id),
    label: pc.name
  }))

  const paymentMethodOptions = paymentMethods.map(pm => ({
    value: String(pm.id),
    label: pm.name
  }))

  const allSubsegments = segments.map(segment => ({
    category: segment.name,
    items: segment.subSegments.map(sub => ({
      value: String(sub.id),
      label: sub.name
    }))
  }))

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
        subSegmentId: Number(data.subSegmentId),
        cep: data.cep.replace(/\D/g, ''),
        document: data.document.replace(/\D/g, ''),
        phoneNumber: data.phoneNumber.replace(/\D/g, ''),
        // A API devolve `null` para clientes sem tipo classificado; o Select trata isso como
        // "nada selecionado", mas o schema de envio só aceita undefined.
        customerType: data.customerType ?? undefined
      }

      const response = await updateCustomerAction(companyId, customer.id, payload)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      await processCustomerPaymentChanges({
        currentIds: currentPaymentConditionIds,
        newIds: data.paymentConditionIds,
        addAction: id => addCustomerPaymentCondition(companyId, customer.id, Number(id)),
        removeAction: id => removeCustomerPaymentCondition(companyId, customer.id, id)
      })

      await processCustomerPaymentChanges({
        currentIds: currentPaymentMethodIds,
        newIds: data.paymentMethodsIds,
        addAction: id => addCustomerPaymentMethod(companyId, customer.id, Number(id)),
        removeAction: id => removeCustomerPaymentMethod(companyId, customer.id, id)
      })

      toast({
        title: 'Cliente atualizado com sucesso',
        status: 'success'
      })
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao atualizar cliente'

      toast({
        title: message,
        status: 'error'
      })
    }
  })

  const lastOrderDisplay = daysSinceLastOrder || 'Nenhum pedido registrado'

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className='space-y-6'>
        <Card className='rounded-2xl border-border bg-surface'>
          <CardHeader>
            <CardTitle className='text-h3 text-text'>Informações gerais</CardTitle>
            <CardDescription className='text-caption text-text-muted'>Dados cadastrais e classificação do cliente</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='document'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex. 000.000.000-00'
                        {...field}
                        value={formatCpfCnpj(field.value)}
                        onChange={e => field.onChange(formatCpfCnpj(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='stateRegistration'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Estadual</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex. 123456789'
                        maxLength={9}
                        {...field}
                        onChange={e => field.onChange(removeNonNumericChars(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='corporateName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex. Empresa LTDA' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='fantasyName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex. Empresa' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='customerType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Cliente</FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione o tipo' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CUSTOMER_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Último Pedido</FormLabel>
                <Input value={lastOrderDisplay} disabled readOnly />
              </FormItem>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione um status' />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(CustomerStatus).map(status => (
                            <SelectItem key={status} value={status}>
                              {getCustomerStatusText(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='gln'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número global de localização (GLN)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Insira o GLN'
                        maxLength={13}
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(removeNonNumericChars(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='subSegmentId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Segmento</FormLabel>
                  <FormControl>
                    <Select onValueChange={value => field.onChange(value)} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione um segmento' />
                      </SelectTrigger>
                      <SelectContent>
                        {allSubsegments.length > 0 ? (
                          allSubsegments.map(segment => (
                            <SelectGroup key={segment.category}>
                              <SelectLabel>{segment.category}</SelectLabel>
                              {segment.items.map(item => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))
                        ) : (
                          <SelectGroup>
                            <SelectLabel>Nenhum segmento disponível</SelectLabel>
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='tags'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagsInput
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder='Digite uma tag e pressione Enter'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className='rounded-2xl border-border bg-surface'>
          <CardHeader>
            <CardTitle className='text-h3 text-text'>Financeiro</CardTitle>
            <CardDescription className='text-caption text-text-muted'>Limite de crédito e formas de pagamento</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='creditLimit'
              render={({ field }) => (
                <InputCurrency
                  label='Limite de crédito'
                  placeholder='Limite de crédito'
                  {...field}
                  onChange={e => field.onChange(e.target.value)}
                />
              )}
            />

            <FormField
              control={form.control}
              name='paymentMethodsIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Métodos de Pagamento</FormLabel>
                  <MultiSelect
                    options={paymentMethodOptions}
                    onValueChange={value => field.onChange(value.map(Number))}
                    defaultValue={field.value?.map(String)}
                    placeholder='Métodos de pagamento'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='paymentConditionIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condições de Pagamento</FormLabel>
                  <MultiSelect
                    options={paymentConditionOptions}
                    onValueChange={value => field.onChange(value.map(Number))}
                    defaultValue={field.value?.map(String)}
                    placeholder='Condições de pagamento'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className='rounded-2xl border-border bg-surface'>
          <CardHeader>
            <CardTitle className='text-h3 text-text'>Endereço</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex. Rua A, 123' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='neighborhood'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex. Centro' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex. São Paulo' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='UF'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione um estado' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CountryState).map(state => (
                          <SelectItem key={state} value={state}>
                            {getCountryStateText(state)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='cep'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex. 00000-000'
                        {...field}
                        value={formatPostalCode(field.value)}
                        onChange={e => field.onChange(formatPostalCode(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-2xl border-border bg-surface'>
          <CardHeader>
            <CardTitle className='text-h3 text-text'>Contato</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex.: contato@empresa.com.br' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex. (00) 00000-0000'
                        {...field}
                        value={formatPhoneNumber(field.value)}
                        onChange={e => field.onChange(formatPhoneNumber(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website/Link (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex. https://www.sellou.com.br' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className='rounded-2xl border-border bg-surface'>
          <CardHeader>
            <CardTitle className='text-h3 text-text'>Informações adicionais</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='observations'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      className='resize-none'
                      placeholder='Ex. Entregas preferencialmente no período da manhã'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
