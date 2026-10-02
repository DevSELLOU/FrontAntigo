'use client'

import { addCustomerPaymentCondition } from '@/actions/customer-payment-condition/add-payment-condition.action'
import { addCustomerPaymentMethod } from '@/actions/customer-payment-method/add-payment-method.action'
import { createCustomerAction } from '@/actions/customer/create-customer.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CountryState } from '@/enums/country-state.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { CustomerSchema } from '@/schemas/customer.schema'
import { CustomerWrapper } from '@/types/customer-wrapper.type'
import { CustomerDto } from '@/types/dto/customer-dto'
import { addCustomerPaymentItems } from '@/utils/add-customer-payment-items.util'
import { formatCpfCnpj } from '@/utils/format/format-cpf-cnpj.util'
import { formatPhoneNumber } from '@/utils/format/format-phone.util'
import { formatPostalCode } from '@/utils/format/format-postal-code.util'
import { getCountryStateText } from '@/utils/get-country-state-text.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { removeNonNumericChars } from '@/utils/remove-non-numeric-chars.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loading } from '../../loading'
import { Button } from '../../ui/button'
import InputCurrency from '../../ui/input-currency'
import { MultiSelect } from '../../ui/multi-select'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '../../ui/select'
import { Textarea } from '../../ui/textarea'
import { getCustomerStatusText } from '@/utils/get-customer-status-text.util'
import { normalizeCompanyUsers } from '@/utils/company-users.util'

interface ModalProps {
  open: boolean
  onClose: () => void
  customerWrapper: CustomerWrapper
}

export function CreateCustomerModal({ open, onClose, customerWrapper }: ModalProps): JSX.Element {
  const { toast } = useToast()

  const form = useForm<CustomerDto>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      corporateName: '',
      document: '',
      fantasyName: '',
      email: '',
      phoneNumber: '',
      address: '',
      cep: '',
      neighborhood: '',
      city: '',
      UF: CountryState.AC,
      creditLimit: 0,
      stateRegistration: '',
      gln: '',
      subSegmentId: '',
      status: CustomerStatus.Active,
      sellerIds: []
    }
  })

  const paymentConditions = customerWrapper.paymentConditions.map(paymentCondition => ({
    value: String(paymentCondition.id),
    label: paymentCondition.name
  }))

  const paymentMethods = customerWrapper.paymentMethods.map(paymentMethod => ({
    value: String(paymentMethod.id),
    label: paymentMethod.name
  }))

  const sellers = normalizeCompanyUsers(customerWrapper.users).map(seller => ({
    value: String(seller.id),
    label: seller.name
  }))

  const allSubsegments = customerWrapper.segments.map(segment => ({
    category: segment.name,
    items: segment.subSegments.map(subsegment => ({
      value: String(subsegment.id),
      label: subsegment.name
    }))
  }))

  const onSubmit = form.handleSubmit(async data => {
    try {
      const payload = {
        ...data,
        subSegmentId: Number(data.subSegmentId)
      }

      const response = await createCustomerAction(customerWrapper.companyId, payload)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      await addCustomerPaymentItems({
        items: payload.paymentConditionIds,
        addAction: paymentConditionId =>
          addCustomerPaymentCondition(customerWrapper.companyId, response.data.id, paymentConditionId)
      })

      await addCustomerPaymentItems({
        items: payload.paymentMethodsIds,
        addAction: paymentMethodId =>
          addCustomerPaymentMethod(customerWrapper.companyId, response.data.id, paymentMethodId)
      })

      toast({
        title: 'Cliente criado com sucesso',
        status: 'success'
      })

      form.reset()
      onClose()
    } catch (error: any) {
      const message = error?.message ?? 'Erro desconhecido ao criar cliente'

      toast({
        title: message,
        status: 'error'
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='xl:max-w-2xl xl:max-h-[95%] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Criar cliente</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para criar um novo cliente.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className='flex flex-col gap-4 w-full'>
            <div className='flex flex-col xl:flex-row gap-4 w-full'>
              <FormField
                control={form.control}
                name='document'
                render={({ field }) => (
                  <FormItem className='xl:w-1/2'>
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
                  <FormItem className='xl:w-1/2'>
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

            <div className='flex flex-col xl:flex-row gap-4 w-full'>
              <FormField
                control={form.control}
                name='corporateName'
                render={({ field }) => (
                  <FormItem className='xl:w-1/2'>
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
                  <FormItem className='xl:w-1/2'>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex. Empresa' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex flex-col xl:flex-row gap-4 w-full'>
              <FormField
                control={form.control}
                name='gln'
                render={({ field }) => (
                  <FormItem className='xl:w-1/2'>
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

              <FormField
                control={form.control}
                name='subSegmentId'
                render={({ field }) => (
                  <FormItem className='xl:w-1/2'>
                    <FormLabel>Segmento</FormLabel>
                    <FormControl>
                      <Select onValueChange={value => field.onChange(value)} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione um segmento' />
                        </SelectTrigger>
                        <SelectContent>
                          {allSubsegments?.length > 0 ? (
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
                name='status'
                render={({ field }) => (
                  <FormItem className='xl:w-1/2'>
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
            </div>

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
                    options={paymentMethods}
                    onValueChange={value => field.onChange(value.map(Number))}
                    defaultValue={field?.value?.map(String)}
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
                    options={paymentConditions}
                    onValueChange={value => field.onChange(value.map(Number))}
                    defaultValue={field?.value?.map(String)}
                    placeholder='Condições de pagamento'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='sellerIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendedores Responsáveis</FormLabel>
                  <MultiSelect
                    options={sellers}
                    onValueChange={value => field.onChange(value.map(Number))}
                    defaultValue={field?.value?.map(String)}
                    placeholder='Selecione um ou mais vendedores'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex. Rua A' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex flex-col xl:flex-row gap-4'>
              <FormField
                control={form.control}
                name='neighborhood'
                render={({ field }) => (
                  <FormItem className='xl:w-1/2'>
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
                  <FormItem className='xl:w-1/2'>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex. São Paulo' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex flex-col xl:flex-row gap-4'>
              <FormField
                control={form.control}
                name='UF'
                render={({ field }) => (
                  <FormItem className='xl:w-1/2'>
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
                  <FormItem className='xl:w-1/2'>
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
            <div className='flex flex-col xl:flex-row gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='xl:w-1/2'>
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
                  <FormItem className='xl:w-1/2'>
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
            <div className='flex items-center justify-end gap-3'>
              <Button type='button' variant='secondary' onClick={onClose}>
                Cancelar
              </Button>
              <Button type='submit' disabled={form.formState.isSubmitting}>
                Criar
                {form.formState.isSubmitting && <Loading />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
