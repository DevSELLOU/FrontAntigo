'use client'

import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserRole } from '@/enums/user-role.enum'
import { zodResolver } from '@hookform/resolvers/zod'
import { track } from '@vercel/analytics/react'
import { Session } from 'next-auth'
import { getSession, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loading } from '../loading'

const SignInFormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

function SignInFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [session, setSession] = useState<Session | null>(null)

  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    async function checkSession() {
      if (!error) {
        const currentSession = await getSession()
        setSession(currentSession)

        if (currentSession) {
          let redirectUrl = '/sign-in'

          if (currentSession.user.activeCompanyId) {
            redirectUrl = `/company/${currentSession.user.activeCompanyId}/dashboard`
          } else if (currentSession.user.role === UserRole.Administrator) {
            redirectUrl = '/dashboard'
          }

          router.push(redirectUrl)
        }
      }
    }

    if (searchParams.get('session') !== 'true') {
      checkSession()
    }
  }, [router, searchParams, error])

  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = form.handleSubmit(async data => {
    const session = await getSession()

    // Sem o e-mail: ele é dado pessoal e seguia para a Vercel (EUA) a cada login. O evento
      // continua medindo o que interessa — que houve um login — sem identificar quem.
      track('sign-in')

    let callbackUrl = '/dashboard'

    if (session?.user?.activeCompanyId) {
      callbackUrl = `/company/${session.user.activeCompanyId}/dashboard`
    } else if (session?.user?.role === UserRole.Administrator) {
      callbackUrl = '/dashboard'
    }

    await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: true,
      callbackUrl
    })
  })

  if (session) return null

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      {/* Access chip */}
      <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-050 border border-brand-200'>
        <div className='w-2 h-2 rounded-full bg-brand-700' />
        <span className='text-caption font-semibold text-brand-700'>ACESSO À PLATAFORMA</span>
      </div>

      {/* Greeting */}
      <div>
        <h1 className='text-h1 text-text font-bold'>Bem-vindo de volta</h1>
        <p className='text-body text-text-muted mt-2'>
          Digite seus dados para acessar sua conta
        </p>
      </div>

      {/* Error alert */}
      {error === 'CredentialsSignin' && (
        <div
          className='flex gap-3 rounded-lg bg-danger-foreground/10 border border-danger-border p-4'
          role='alert'
        >
          <AlertCircle className='h-5 w-5 text-danger-foreground shrink-0 mt-0.5' />
          <p className='text-body text-danger-foreground'>
            Email ou senha inválidos. Verifique seus dados e tente novamente.
          </p>
        </div>
      )}

      {/* Email field */}
      <div>
        <label className='block text-label text-text-body mb-2'>
          Email <span className='text-danger-foreground'>*</span>
        </label>
        <Input
          type='email'
          placeholder='seu.email@empresa.com'
          {...form.register('email')}
          disabled={form.formState.isSubmitting}
          className='bg-surface border-border'
        />
        {form.formState.errors.email && (
          <p className='text-caption text-danger-foreground mt-1'>
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Password field with forgot link */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <label className='block text-label text-text-body'>
            Senha <span className='text-danger-foreground'>*</span>
          </label>
          <button
            type='button'
            onClick={() => router.push('/forgot-password')}
            disabled={form.formState.isSubmitting}
            className='text-caption font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Esqueci minha senha
          </button>
        </div>
        <div className='relative'>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder='••••••••'
            {...form.register('password')}
            disabled={form.formState.isSubmitting}
            className='bg-surface border-border pr-10'
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors'
          >
            {showPassword ? (
              <EyeOff className='h-5 w-5' />
            ) : (
              <Eye className='h-5 w-5' />
            )}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className='text-caption text-danger-foreground mt-1'>
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type='submit'
        disabled={form.formState.isSubmitting}
        className='w-full gap-2'
      >
        {form.formState.isSubmitting ? (
          <>
            <Loading />
            Entrando...
          </>
        ) : (
          'Entrar na plataforma'
        )}
      </Button>

      {/* Afirmação verificável, não promessa. "Seus dados são criptografados e seguros" alegava
          criptografia em repouso, que não foi possível confirmar em lugar nenhum do código — e é o
          tipo de frase que alguém teria de sustentar se um cliente perguntasse. HTTPS a gente
          comprova. */}
      <p className='text-caption text-text-muted text-center'>
        Conexão segura via HTTPS. Veja nossa{' '}
        {/* `/privacy` não existe — a rota é `/privacy-policy`, então este link dava 404.
            `text-primary` e não `text-brand-700`: o §12.1 do DESIGN.md mede 3.2:1 no escuro
            para o brand-700, abaixo do AA. */}
        <a href='/privacy-policy' className='text-primary hover:underline'>
          política de privacidade
        </a>
        .
      </p>
    </form>
  )
}

export function SignInForm() {
  return (
    <Suspense fallback={<Loading />}>
      <SignInFormContent />
    </Suspense>
  )
}
