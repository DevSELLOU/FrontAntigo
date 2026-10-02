'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useShop } from '@/hooks/use-shop'
import { useShopAuth } from '@/hooks/use-shop-auth'
import { useToast } from '@/hooks/use-toast'
import { RETURN_TO_PARAM, resolveShopReturnTo } from '@/utils/shop-return-to.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { track } from '@vercel/analytics/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loading } from '../loading'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

const SignInFormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
})

function SignInFormContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { company } = useShop()
  const { signIn, isAuthenticated } = useShopAuth()
  const searchParams = useSearchParams()

  // Para onde o comprador volta depois de entrar. `resolveShopReturnTo` é a fronteira de
  // segurança: só aceita caminho relativo dentro DESTA loja, senão `?returnTo=https://...`
  // transformaria o login numa página de redirecionamento aberto.
  const destination = resolveShopReturnTo(searchParams.get(RETURN_TO_PARAM), company?.fantasyName ?? '')

  useEffect(() => {
    if (isAuthenticated) {
      router.push(destination)
    }
  }, [isAuthenticated, destination, router])

  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: data.email, password: data.password })
      })

      const contentType = response.headers.get('content-type')
      if (!response.ok) {
        if (contentType?.includes('application/json')) {
          const { message } = await response.json()
          form.setError('email', { type: 'manual', message: message || 'Email ou senha inválidos.' })
          form.setError('password', { type: 'manual', message: message || 'Email ou senha inválidos.' })
        } else {
          form.setError('email', { type: 'manual', message: 'Número máximo de tentativas excedido. Tente novamente mais tarde.' })
        }
        return
      }

      if (!contentType?.includes('application/json')) {
        form.setError('email', { type: 'manual', message: 'Erro de servidor. Tente novamente mais tarde.' })
        return
      }

      const { data: loginResponse } = await response.json()

      if (loginResponse) {
        // Sem o e-mail: ele é dado pessoal e seguia para a Vercel (EUA) a cada login. O evento
      // continua medindo o que interessa — que houve um login — sem identificar quem.
      track('shop-sign-in')
        signIn(loginResponse.accessToken, loginResponse.user)
        toast({ title: 'Login efetuado com sucesso!', status: 'success' })

        router.push(destination)
      }
    } catch (error: any) {
      const title = error?.message ?? 'Ocorreu um erro inesperado. Por favor, verifique sua conexão e tente novamente.'

      return toast({
        title,
        status: 'error'
      })
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <div className='flex flex-col gap-4 w-full'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='meu.nome@email.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input placeholder='********' type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Link
            href={`/shop/${encodeURIComponent(company?.fantasyName ?? '')}/forgot-password`}
            className='w-full text-right text-sm text-text-muted hover:text-text'
          >
            Esqueceu sua senha?
          </Link>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            Entrar
            {form.formState.isSubmitting && <Loading />}
          </Button>

          <div className='flex w-full items-center justify-between mt-5 flex-wrap'>
            <Button
              type='button'
              variant='link'
              className='p-0 text-text-muted'
              disabled={form.formState.isSubmitting}
              onClick={() => router.push(destination)}
            >
              Continuar como visitante
            </Button>

            <Button
              type='button'
              variant='outline'
              disabled={form.formState.isSubmitting}
              onClick={() => router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}/request-access`)}
            >
              Obter acesso
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export function ShopSignInForm() {
  return (
    <Suspense fallback={<Loading />}>
      <Card className='w-full max-w-[95%] md:max-w-lg'>
        <CardHeader className='space-y-1'>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInFormContent />
        </CardContent>
      </Card>
    </Suspense>
  )
}
