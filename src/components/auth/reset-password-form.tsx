'use client'

import Logo from '@/assets/logo.webp'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PasswordInput } from '@/components/shared/password-input'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loading } from '../loading'

const ResetPasswordFormSchema = z.object({
  password: z.string().min(8, { message: 'Senha deve ter no mínimo 8 caracteres' }),
  passwordConfirmation: z.string().min(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
})

export function ResetPasswordForm() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams()

  const form = useForm<z.infer<typeof ResetPasswordFormSchema>>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      password: '',
      passwordConfirmation: ''
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      if (data.password !== data.passwordConfirmation) {
        form.setError('passwordConfirmation', {
          type: 'manual',
          message: 'Senhas não coincidem'
        })

        throw new CustomError('Senhas não coincidem')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: data.password,
          token: params.token
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorMessage = responseData.message
          ? Array.isArray(responseData.message)
            ? responseData.message.join('\n')
            : responseData.message
          : 'Erro ao recuperar senha. Confira os dados e tente novamente'

        form.setError('passwordConfirmation', {
          type: 'manual',
          message: errorMessage
        })

        throw new CustomError(errorMessage)
      }

      toast({
        title: 'Senha recuperada com sucesso',
        status: 'success'
      })

      router.push('/sign-in')
    } catch (error) {
      const message = error instanceof CustomError ? error.message : 'Erro ao recuperar senha'

      toast({
        title: message,
        status: 'error'
      })
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className='w-full space-y-6'>
        <Image src={Logo} width={200} height={73} alt='Sellou Vendas' className='mx-auto h-10 w-auto' priority />

        <div className='flex w-full flex-col gap-5'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-h1 text-text'>Recuperar senha</h1>
            <p className='text-body text-text-muted'>
              Digite sua nova senha e confirme para recuperar o acesso à sua conta.
            </p>
          </div>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold text-text-body'>Senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete='new-password'
                    placeholder='••••••••'
                    className='bg-surface border-border'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='passwordConfirmation'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold text-text-body'>Confirmação de senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete='new-password'
                    placeholder='••••••••'
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
                Salvando...
              </>
            ) : (
              'Salvar nova senha'
            )}
          </Button>

          <Button
            disabled={form.formState.isSubmitting}
            type='button'
            variant='link'
            onClick={() => router.push('/sign-in')}
            className='font-semibold text-primary'
          >
            Voltar para o login
          </Button>
        </div>
      </form>
    </Form>
  )
}
