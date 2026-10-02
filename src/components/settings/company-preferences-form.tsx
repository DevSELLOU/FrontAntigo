'use client'

import { updateCompanyPreferencesAction } from '@/actions/settings/update-company-preferences.action'
import { COMPANY_COVER_LIMITS, COMPANY_LOGO_LIMITS } from '@/constants/image-limits.constant'
import { CustomError } from '@/errors/custom-error.error'
import { useImageUploadField } from '@/hooks/use-image-upload-field'
import { useToast } from '@/hooks/use-toast'
import { Company } from '@/interfaces/company.interface'
import { CompanyPreferencesSchema } from '@/schemas/company-preferences.schema'
import { CompanyPreferencesDto } from '@/types/dto/company-preferences-dto'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { isValidColor } from '@/utils/is-valid-color.util'
import { setCustomColor } from '@/utils/set-custom-color.util'
import { uploadFileToAws } from '@/utils/upload-file-to-aws.utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { ImageUploadFieldControl } from './image-upload-field'

export function CompanyPreferencesForm({ company }: { company: Company }) {
  const { toast } = useToast()

  const logo = useImageUploadField(COMPANY_LOGO_LIMITS, 'logo')
  const cover = useImageUploadField(COMPANY_COVER_LIMITS, 'cover')

  const isProcessingImage = logo.status === 'processing' || cover.status === 'processing'

  const form = useForm<CompanyPreferencesDto>({
    resolver: zodResolver(CompanyPreferencesSchema),
    defaultValues: {
      logoUrl: company?.logoUrl ?? '',
      coverUrl: company?.coverUrl ?? '',
      customColor: company?.customColor ?? '042F0B', // Verde Sellou
      shopColor: company?.shopColor ?? '042F0B',
      about: company?.about ?? '',
      whatsapp: company?.whatsapp ?? '',
      phone: company?.phone ?? '',
      address: company?.address ?? '',
      businessHours: company?.businessHours ?? '',
      allowOrdersWithoutStock: company?.allowOrdersWithoutStock ?? false
    }
  })

  const onSubmit = form.handleSubmit(async data => {
    // Defensive: the submit button is already disabled while an image is processing, but this
    // guards against any other path into `onSubmit` beating it.
    if (isProcessingImage) {
      toast({ title: 'Aguarde a preparação da imagem terminar.', status: 'error' })
      return
    }

    try {
      if (!isValidColor(data.customColor)) {
        form.setError('customColor', { message: 'Cor inválida' })
        return
      }

      if (!isValidColor(data.shopColor)) {
        form.setError('shopColor', { message: 'Cor inválida' })
        return
      }

      let logoUrl = form.getValues('logoUrl')

      if (logo.file) {
        try {
          logoUrl = await uploadFileToAws(logo.file)
        } catch {
          toast({ title: 'Erro ao fazer upload da logo.', status: 'error' })
          return
        }
      }

      if (!logo.file && !logoUrl) {
        logoUrl = null
      }

      let coverUrl = form.getValues('coverUrl')

      if (cover.file) {
        try {
          coverUrl = await uploadFileToAws(cover.file)
        } catch {
          toast({ title: 'Erro ao fazer upload da capa.', status: 'error' })
          return
        }
      }

      if (!cover.file && !coverUrl) {
        coverUrl = null
      }

      const payload = { ...data, logoUrl, coverUrl }

      const response = await updateCompanyPreferencesAction(company.id, payload)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({ title: 'Preferências atualizadas com sucesso', status: 'success' })

      form.reset({ ...payload })
      setCustomColor(data.customColor)
      window.location.reload()
    } catch (error: any) {
      toast({ title: error.message || 'Erro ao atualizar as preferências', status: 'error' })
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className='flex h-full flex-col justify-between gap-4'>
        <div className='flex flex-col'>
          <FormField
            control={form.control}
            name='customColor'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor Customizada</FormLabel>
                <FormControl>
                  <div className='flex items-center gap-2'>
                    <Input
                      maxLength={6}
                      placeholder='Ex. FFCF0F'
                      startContent={<span>#</span>}
                      {...field}
                      onChange={e => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                        return field.onChange(value.toUpperCase())
                      }}
                    />
                    <div className='relative w-8 h-8 rounded-full border border-input flex-shrink-0 overflow-hidden'>
                      <div
                        className='w-full h-full'
                        style={{ backgroundColor: field.value ? `#${field.value}` : undefined }}
                      />
                      <input
                        type='color'
                        className='absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer'
                        value={field.value ? `#${field.value}` : '#000000'}
                        onChange={e => {
                          field.onChange(e.target.value.substring(1).toUpperCase())
                        }}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='shopColor'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor da Loja</FormLabel>
                <FormControl>
                  <div className='flex items-center gap-2'>
                    <Input
                      maxLength={6}
                      placeholder='Ex. FFCF0F'
                      startContent={<span>#</span>}
                      {...field}
                      onChange={e => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                        return field.onChange(value.toUpperCase())
                      }}
                    />
                    <div className='relative w-8 h-8 rounded-full border border-input flex-shrink-0 overflow-hidden'>
                      <div
                        className='w-full h-full'
                        style={{ backgroundColor: field.value ? `#${field.value}` : undefined }}
                      />
                      <input
                        type='color'
                        className='absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer'
                        value={field.value ? `#${field.value}` : '#000000'}
                        onChange={e => {
                          field.onChange(e.target.value.substring(1).toUpperCase())
                        }}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='allowOrdersWithoutStock'
            render={({ field }) => (
              <FormItem className='mt-4 flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Permitir pedidos sem estoque</FormLabel>
                  <p className='text-sm text-muted-foreground'>
                    Ao ativar, será possível criar pedidos para produtos com quantidade maior que o estoque disponível
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className='mt-5 flex w-full flex-col'>
            <ImageUploadFieldControl
              currentLabel='Logo Atual'
              newLabel='Novo Logo'
              emptyText='SUA LOGO AQUI'
              changeLabel='Alterar Logo'
              currentUrl={form.getValues('logoUrl')}
              field={logo}
              limits={COMPANY_LOGO_LIMITS}
            />
          </div>

          {/* Everything below is what the customer sees at the top of the storefront. */}
          <div className='mt-8 border-t pt-6'>
            <h3 className='text-base font-semibold'>Aparência da loja</h3>
            <p className='mb-4 text-sm text-muted-foreground'>
              A capa e os dados abaixo aparecem no topo da loja, para o cliente saber de quem é o catálogo.
            </p>

            <ImageUploadFieldControl
              currentLabel='Capa Atual'
              newLabel='Nova Capa'
              emptyText='SUA CAPA AQUI'
              changeLabel='Alterar Capa'
              currentUrl={form.getValues('coverUrl')}
              field={cover}
              limits={COMPANY_COVER_LIMITS}
              previewClassName='w-full h-32'
              fit='cover'
              helperText='Imagem panorâmica (16:5). Sem capa, a loja usa a cor da loja — não fica quebrada.'
            />

            <FormField
              control={form.control}
              name='about'
              render={({ field }) => (
                <FormItem className='mt-4'>
                  <FormLabel>Sobre a loja</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      maxLength={600}
                      placeholder='Ex. Distribuidora de materiais elétricos com entrega própria para todo o estado.'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='whatsapp'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex. (11) 98888-7777' {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex. (11) 3344-5566' {...field} value={field.value ?? ''} />
                    </FormControl>
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
                      <Input placeholder='Ex. Av. Paulista, 1000 — São Paulo/SP' {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='businessHours'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de atendimento</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex. Seg a Sex, 8h às 18h' {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Button disabled={form.formState.isSubmitting || isProcessingImage} type='submit'>
          Atualizar
          {form.formState.isSubmitting && <Loading />}
        </Button>
      </form>
    </Form>
  )
}
