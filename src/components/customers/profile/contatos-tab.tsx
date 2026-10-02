'use client'

import { updateCustomerAction } from '@/actions/customer/update-customer.action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Customer, CustomerAddress } from '@/interfaces/customer.interface'
import { useToast } from '@/hooks/use-toast'
import { formatPhoneNumber } from '@/utils/format/format-phone.util'
import { formatPostalCode } from '@/utils/format/format-postal-code.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, MapPin, Phone, Plus, Trash2, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const AddressSchema = z.object({
  postalCode: z.string().min(8, 'CEP é obrigatório'),
  street: z.string().min(1, 'Rua é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional()
})

const ContatosTabSchema = z.object({
  primaryContactName: z.string().optional(),
  emails: z.array(z.string().email('E-mail inválido')),
  phones: z.array(z.string().min(8, 'Telefone inválido')),
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  shippingSameAsBilling: z.boolean()
})

type ContatosTabValues = z.infer<typeof ContatosTabSchema>

interface ContatosTabProps {
  customer: Customer
  companyId: number
}

function emptyAddress(): CustomerAddress {
  return {
    postalCode: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    number: '',
    complement: ''
  }
}

function AddressBlock({
  title,
  prefix,
  disabled
}: {
  title: string
  prefix: 'billingAddress' | 'shippingAddress'
  disabled?: boolean
}) {
  return (
    <div className={disabled ? 'opacity-60 pointer-events-none' : ''}>
      <h4 className='mb-3 text-label text-text'>{title}</h4>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <FormField
          name={`${prefix}.postalCode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input
                  placeholder='00000-000'
                  value={formatPostalCode(field.value || '')}
                  onChange={e => field.onChange(e.target.value.replace(/\D/g, ''))}
                  maxLength={9}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.street`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rua</FormLabel>
              <FormControl>
                <Input placeholder='Nome da rua' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.neighborhood`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input placeholder='Bairro' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input placeholder='Cidade' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.state`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input placeholder='UF' maxLength={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.number`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input placeholder='Número' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.complement`}
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel>Complemento</FormLabel>
              <FormControl>
                <Input placeholder='Apartamento, bloco, etc.' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

export function ContatosTab({ customer, companyId }: ContatosTabProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContatosTabValues>({
    resolver: zodResolver(ContatosTabSchema),
    defaultValues: {
      primaryContactName: customer.primaryContactName || '',
      emails: customer.emails?.length ? customer.emails : [''],
      phones: customer.phones?.length ? customer.phones : [''],
      billingAddress: customer.billingAddress || emptyAddress(),
      shippingAddress: customer.shippingAddress || emptyAddress(),
      shippingSameAsBilling: false
    }
  })

  const shippingSameAsBilling = form.watch('shippingSameAsBilling')
  const billingAddress = form.watch('billingAddress')

  const onSubmit = async (values: ContatosTabValues) => {
    setIsSubmitting(true)
    try {
      const payload: any = {
        primaryContactName: values.primaryContactName,
        emails: values.emails.filter(Boolean),
        phones: values.phones.filter(Boolean),
      }

      // Only include addresses if user has filled meaningful data
      const hasBilling = values.billingAddress && values.billingAddress.postalCode?.replace(/\D/g, '').length >= 8
      const hasShipping = values.shippingAddress && values.shippingAddress.postalCode?.replace(/\D/g, '').length >= 8

      if (hasBilling) {
        payload.billingAddress = values.billingAddress
      }
      if (values.shippingSameAsBilling && hasBilling) {
        payload.shippingAddress = values.billingAddress
      } else if (hasShipping) {
        payload.shippingAddress = values.shippingAddress
      }

      const response = await updateCustomerAction(companyId, customer.id, payload)

      if ('error' in response || ('message' in response && !('data' in response))) {
        toast({ title: 'Erro ao atualizar cliente', status: 'error' })
      } else {
        toast({ title: 'Cliente atualizado com sucesso', status: 'success' })
      }
    } catch {
      toast({ title: 'Erro ao atualizar cliente', status: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addEmail = () => {
    const current = form.getValues('emails')
    form.setValue('emails', [...current, ''])
  }

  const removeEmail = (index: number) => {
    const current = form.getValues('emails')
    if (current.length <= 1) {
      form.setValue('emails', [''])
      return
    }
    form.setValue('emails', current.filter((_, i) => i !== index))
  }

  const addPhone = () => {
    const current = form.getValues('phones')
    form.setValue('phones', [...current, ''])
  }

  const removePhone = (index: number) => {
    const current = form.getValues('phones')
    if (current.length <= 1) {
      form.setValue('phones', [''])
      return
    }
    form.setValue('phones', current.filter((_, i) => i !== index))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <Card className='rounded-2xl border-border bg-surface'>
          <CardHeader>
            <CardTitle className='text-h3 text-text'>Contato principal</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='primaryContactName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do contato</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted' />
                      <Input placeholder='Nome do responsável' className='pl-9' {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-3'>
              <Label className='flex items-center gap-2'>
                <Mail className='h-4 w-4' />
                E-mails
              </Label>
              {form.watch('emails').map((_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`emails.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='flex gap-2'>
                          <Input type='email' placeholder='email@exemplo.com' {...field} />
                          <Button type='button' variant='outline' size='icon' onClick={() => removeEmail(index)} aria-label={`Remover e-mail ${index + 1}`}>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button type='button' variant='outline' size='sm' onClick={addEmail}>
                <Plus className='mr-2 h-4 w-4' />
                Adicionar e-mail
              </Button>
            </div>

            <div className='space-y-3'>
              <Label className='flex items-center gap-2'>
                <Phone className='h-4 w-4' />
                Telefones
              </Label>
              {form.watch('phones').map((_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`phones.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='flex gap-2'>
                          <Input
                            placeholder='(00) 00000-0000'
                            value={formatPhoneNumber(field.value || '')}
                            onChange={e => field.onChange(e.target.value.replace(/\D/g, ''))}
                            maxLength={15}
                          />
                          <Button type='button' variant='outline' size='icon' onClick={() => removePhone(index)} aria-label={`Remover telefone ${index + 1}`}>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button type='button' variant='outline' size='sm' onClick={addPhone}>
                <Plus className='mr-2 h-4 w-4' />
                Adicionar telefone
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-2xl border-border bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-h3 text-text'>
              <MapPin className='h-5 w-5 text-text-muted' />
              Endereços
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <AddressBlock title='Endereço de cobrança' prefix='billingAddress' />

            <div className='flex items-center space-x-2 pt-2'>
              <Checkbox
                id='same-address'
                checked={shippingSameAsBilling}
                onCheckedChange={checked => {
                  form.setValue('shippingSameAsBilling', checked === true)
                  if (checked === true) {
                    form.setValue('shippingAddress', billingAddress)
                  }
                }}
              />
              <Label htmlFor='same-address' className='font-normal cursor-pointer'>
                Endereço de entrega igual ao de cobrança
              </Label>
            </div>

            <AddressBlock
              title='Endereço de entrega'
              prefix='shippingAddress'
              disabled={shippingSameAsBilling}
            />
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
