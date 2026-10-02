'use client'

import { changePasswordAction } from '@/actions/settings/change-password.action'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { ChangePasswordSchema } from '@/schemas/change-password.schema'
import { ChangePasswordDto } from '@/types/dto/change-password-dto'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { memo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PasswordInput } from '../shared/password-input'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

const criteriaList = [
  { key: 'length', text: 'Mínimo de 8 caracteres' },
  { key: 'lowercase', text: 'Pelo menos 1 letra minúscula' },
  { key: 'uppercase', text: 'Pelo menos 1 letra maiúscula' },
  { key: 'specialChar', text: 'Pelo menos 1 caractere especial' },
  { key: 'number', text: 'Pelo menos 1 número' }
]

const CriteriaItem = memo(({ criteria, text }: { criteria: boolean; text: string }) => (
  <li className={criteria ? 'line-through italic text-text-muted' : ''}>{text}</li>
))

CriteriaItem.displayName = 'CriteriaItem'

export function ChangePassswordForm({ shopAccessToken }: { shopAccessToken?: string }) {
  const { toast } = useToast()

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false
  })

  const isAllCriteriaMet = Object.values(passwordCriteria).every(criteria => criteria)

  const form = useForm<ChangePasswordDto>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      passwordConfirmation: ''
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      if (data.newPassword !== data.passwordConfirmation) {
        form.setError('passwordConfirmation', {
          message: 'A confirmação de senha não é igual à nova senha'
        })

        return
      }

      const response = await changePasswordAction(data, shopAccessToken)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Senha alterada com sucesso',
        status: 'success'
      })

      form.reset()
    } catch (error: any) {
      const title = error?.message ?? 'Erro desconhecido ao alterar senha'

      return toast({
        title,
        status: 'error'
      })
    }
  })

  const validatePassword = (password: string) => {
    setPasswordCriteria({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className='flex flex-col gap-4'>
        <FormField
          control={form.control}
          name='currentPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha atual</FormLabel>
              <FormControl>
                <PasswordInput autoComplete='current-password' placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete='new-password'
                  placeholder='********'
                  {...field}
                  onChange={e => {
                    field.onChange(e)
                    validatePassword(e.target.value)
                  }}
                  className='w-full'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ul className='text-caption text-text-body'>
          {criteriaList.map(({ key, text }) => (
            <CriteriaItem key={key} criteria={passwordCriteria[key as keyof typeof passwordCriteria]} text={text} />
          ))}
        </ul>

        <FormField
          control={form.control}
          name='passwordConfirmation'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmação de senha</FormLabel>
              <FormControl>
                <PasswordInput autoComplete='new-password' placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={form.formState.isSubmitting || !isAllCriteriaMet} type='submit'>
          Alterar senha
          {form.formState.isSubmitting && <Loading />}
        </Button>
      </form>
    </Form>
  )
}
