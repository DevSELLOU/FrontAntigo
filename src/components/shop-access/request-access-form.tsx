'use client'

import { requestAccessAction } from '@/actions/shop/request-access.action'
import { CustomError } from '@/errors/custom-error.error'
import { useShop } from '@/hooks/use-shop'
import { useShopAuth } from '@/hooks/use-shop-auth'
import { useToast } from '@/hooks/use-toast'
import { RequestShopAccessSchema } from '@/schemas/request-shop-access.schema'
import { RequestShopAccessDto } from '@/types/dto/request-shop-access-dto'
import { formatCnpj } from '@/utils/format/format-cnpj.util'
import { formatPhoneNumber } from '@/utils/format/format-phone.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import RequestAccessSuccess from './request-success'

export function RequestShopAccessFormContent({
  setCardContent
}: {
  setCardContent: Dispatch<SetStateAction<'request' | 'success'>>
}) {
  const router = useRouter()
  const { company } = useShop()
  const { toast } = useToast()
  const { isAuthenticated } = useShopAuth()

  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}`)
    }
  }, [isAuthenticated])

  const form = useForm<RequestShopAccessDto>({
    resolver: zodResolver(RequestShopAccessSchema),
    defaultValues: {
      cnpj: '',
      email: '',
      companyName: '',
      fullName: '',
      phoneNumber: ''
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    if (!company) return

    try {
      const response = await requestAccessAction(company.id, data)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: response.message,
        status: 'success'
      })

      form.reset()
      setCardContent('success')
    } catch (error: any) {
      const message = error?.message || 'Erro desconhecido ao requisitar acesso'

      toast({
        title: message,
        status: 'error'
      })
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className='flex flex-col gap-4'>
        <FormField
          control={form.control}
          name='companyName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa</FormLabel>
              <FormControl>
                <Input placeholder='Ex. Empresa LTDA' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='cnpj'
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input
                  placeholder='Ex. 00.000.000/0000-00'
                  {...field}
                  value={formatCnpj(field.value)}
                  onChange={e => field.onChange(formatCnpj(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='fullName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder='Ex. Fulano de Tal' {...field} />
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

        <Button type='submit' disabled={form.formState.isSubmitting}>
          Requisitar
          {form.formState.isSubmitting && <Loading />}
        </Button>

        <div className='flex w-full items-center justify-between mt-5 flex-wrap'>
          <Button
            type='button'
            variant='link'
            className='p-0 text-text-muted'
            disabled={form.formState.isSubmitting}
            onClick={() => router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}`)}
          >
            Continuar como visitante
          </Button>

          <Button
            type='button'
            variant='outline'
            disabled={form.formState.isSubmitting}
            onClick={() => router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}/sign-in`)}
          >
            Já possuo acesso
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function RequestShopAccessForm() {
  const [cardContent, setCardContent] = useState<'request' | 'success'>('request')

  return cardContent === 'request' ? (
    <Card className='w-full max-w-[95%] md:max-w-lg'>
      <CardHeader className='space-y-1'>
        <CardTitle>Requisitar Acesso</CardTitle>

        <CardDescription>Preencha os campos abaixo para solicitar acesso à loja</CardDescription>
      </CardHeader>
      <CardContent>
        <RequestShopAccessFormContent setCardContent={setCardContent} />
      </CardContent>
    </Card>
  ) : cardContent === 'success' ? (
    <RequestAccessSuccess />
  ) : null
}
