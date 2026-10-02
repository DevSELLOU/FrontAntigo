'use client'

import Logo from '@/assets/logo.webp'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loading } from '../loading'

const ForgotPasswordFormSchema = z.object({
  email: z.string().email('Email inválido')
})

export function ForgotPasswordForm({
  pathname = '/sign-in',
  hideLogo = false,
  className
}: {
  pathname?: string
  hideLogo?: boolean
  className?: string
}) {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof ForgotPasswordFormSchema>>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new CustomError('Erro desconhecido')
      }

      if (isApiErrorResponse(response)) {
        throw new CustomError('Erro ao enviar email de recuperação de senha')
      }

      toast({
        title: 'Email de recuperação de senha enviado',
        status: 'success'
      })
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro desconhecido'

      toast({
        title: message,
        status: 'error'
      })
    }
  })

  function handleBackToLogin() {
    router.push(pathname)
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className='w-full space-y-6'>
        {!hideLogo && (
          <Image src={Logo} width={200} height={73} alt='Sellou Vendas' className='mx-auto h-10 w-auto' priority />
        )}

        <div className={cn('flex w-full flex-col gap-5', className)}>
          <div className='flex flex-col gap-1'>
            {/* Plain strings on purpose: `cn` runs tailwind-merge, which collapses two
                custom `text-*` tokens (`text-h1` + `text-text`) into the last one. */}
            <h1 className={hideLogo ? 'text-h3 text-text' : 'text-h1 text-text'}>Recuperar senha</h1>
            <p className='text-body text-text-muted'>
              Digite seu email e enviaremos um link para você recuperar sua senha.
            </p>
          </div>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold text-text-body'>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    autoComplete='email'
                    placeholder='meu.nome@email.com'
                    className='bg-surface border-border'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Same loading grammar as sign-in: the spinner replaces the label instead of
              being appended to it, so the button keeps its width (DESIGN §4). */}
          <Button disabled={form.formState.isSubmitting} type='submit' className='w-full gap-2'>
            {form.formState.isSubmitting ? (
              <>
                <Loading />
                Enviando...
              </>
            ) : (
              'Enviar link de recuperação'
            )}
          </Button>

          <Button
            disabled={form.formState.isSubmitting}
            type='button'
            variant='link'
            onClick={handleBackToLogin}
            className='font-semibold text-primary'
          >
            Voltar para o login
          </Button>
        </div>
      </form>
    </Form>
  )
}
