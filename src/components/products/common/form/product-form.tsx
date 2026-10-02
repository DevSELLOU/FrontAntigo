'use client'

import type React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import * as Collapsible from '@radix-ui/react-collapsible'
import {
  ArrowLeft,
  Barcode,
  Box,
  ChevronDown,
  FileText,
  ImagePlus,
  Package,
  Ruler,
  Save,
  Star,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'

import { createProductAction } from '@/actions/product/create-product.action'
import { updateProductAction } from '@/actions/product/update-product.action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import InputCurrency from '@/components/ui/input-currency'
import { MultiSelect } from '@/components/ui/multi-select'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { SortableProductImages, type SortableImageItem } from './sortable-product-images'
import { useImageProcessingQueue, type QueueItemResult } from '@/hooks/use-image-processing-queue'
import { DEFAULT_FRAMING, type Framing } from '@/utils/image/crop-plan.util'
import { useToast } from '@/hooks/use-toast'
import { PRODUCT_IMAGE_LIMITS } from '@/constants/image-limits.constant'
import type { Category } from '@/interfaces/category.interface'
import type { Product, ProductPhoto } from '@/interfaces/product.interface'
import { ProductSchema } from '@/schemas/product.schema'
import type { ProductDto } from '@/types/dto/product-dto'
import { formatPercentageValue } from '@/utils/format/format-percentage-value.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { uploadFileToAws } from '@/utils/upload-file-to-aws.utils'

const DimensionUnit = {
  Millimeter: 'mm',
  Centimeter: 'cm',
  Meter: 'm'
} as const

const WeightUnit = {
  Gram: 'g',
  Kilogram: 'kg'
} as const

interface ProductFormProps {
  companyId: number
  product?: Product
  categories: Category[]
}

function SectionHeader({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <CardHeader className='px-5 py-4 sm:px-6'>
      <Collapsible.Trigger className='group flex w-full items-center justify-between gap-4 text-left'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF9ED] text-[#008440]'>
            {icon}
          </div>

          <div className='min-w-0'>
            <CardTitle className='text-base font-bold text-text sm:text-lg'>
              {title}
            </CardTitle>

            <p className='mt-0.5 text-xs leading-5 text-text-muted sm:text-sm'>
              {description}
            </p>
          </div>
        </div>

        <ChevronDown className='h-4 w-4 shrink-0 text-text-muted transition-transform group-data-[state=open]:rotate-180' />
      </Collapsible.Trigger>
    </CardHeader>
  )
}

function UnitField({
  value,
  onChange,
  options
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      className='bg-transparent text-xs font-medium text-text-muted outline-none'
      value={value}
      onChange={event => onChange(event.target.value)}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function ProductForm({
  companyId,
  product,
  categories
}: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const headerSaveRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isHeaderSaveVisible, setIsHeaderSaveVisible] = useState(true)

  useEffect(() => {
    setMounted(true)

    return () => {
      setMounted(false)
    }
  }, [])

  useEffect(() => {
    const element = headerSaveRef.current

    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderSaveVisible(entry.isIntersecting)
      },
      {
        threshold: 0.15
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])
  const [selectedDimensionUnit, setSelectedDimensionUnit] =
    useState<string>(product?.widthUnit || DimensionUnit.Centimeter)
  const [selectedWeightUnit, setSelectedWeightUnit] =
    useState<string>(product?.weightUnit || WeightUnit.Kilogram)

  const { enqueue: enqueueImageProcessing } = useImageProcessingQueue(PRODUCT_IMAGE_LIMITS)
  const nextClientKeyRef = useRef(0)

  const [imagesWithPreviews, setImagesWithPreviews] = useState<SortableImageItem[]>(
    product?.photos?.map(photo => ({
      preview: photo.url,
      isExisting: true,
      photoId: photo.id,
      description: photo.description
    })) || []
  )

  const form = useForm<ProductDto>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      colors: product?.colors || '',
      brand: product?.brand || '',
      unitOfMeasure: product?.unitOfMeasure || '',
      reference: product?.reference || '',
      model: product?.model || '',
      videoUrl: product?.videoUrl || '',
      price: product?.price ? Number(product.price) : 0,
      width: product?.width || undefined,
      height: product?.height || undefined,
      length: product?.length || undefined,
      thickness: product?.thickness || undefined,
      netWeight: product?.netWeight || undefined,
      ncm: product?.ncm || '',
      subCategoryIds: product?.subCategories?.map(sc => sc.id) || [],
      ipi: product?.ipi || 0,
      st: product?.st || 0,
      barcode: product?.barcode || '',
      supplierCode: product?.supplierCode || '',
      manufacturer: product?.manufacturer || '',
      icms: product?.icms || 0,
      favorite: product?.favorite || false,
      active: product?.active !== false,
      widthUnit: product?.widthUnit || selectedDimensionUnit,
      heightUnit: product?.heightUnit || selectedDimensionUnit,
      lengthUnit: product?.lengthUnit || selectedDimensionUnit,
      thicknessUnit: product?.thicknessUnit || selectedDimensionUnit,
      weightUnit: product?.weightUnit || selectedWeightUnit
    }
  })

  const allSubcategories = categories.flatMap(category =>
    category?.subCategories?.map(subcategory => ({
      value: String(subcategory?.id),
      label: subcategory?.name,
      category: category?.name
    })) || []
  )

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return

    const newFiles = Array.from(event.target.files)
    const validFiles: File[] = []

    newFiles.forEach(file => {
      // This used to reject anything over 5MB — exactly the file this whole feature exists to
      // fix. The real ceiling now is generous and only exists to block something absurd before
      // spending CPU decoding it; the crop/resize engine below is what actually shrinks the file.
      if (file.size > 40 * 1024 * 1024) {
        toast({
          title: `O arquivo ${file.name} excede o limite de 40MB.`,
          status: 'error'
        })
      } else {
        validFiles.push(file)
      }
    })

    if (validFiles.length === 0) {
      event.target.value = ''
      return
    }

    // Uploading is synchronous from the user's point of view — the grid shows every picked
    // file right away, with its own preview, while the crop/resize engine (off the main
    // thread) catches up per item. `clientKey` is what lets the treated file/preview replace
    // the placeholder later without dnd-kit losing track of the card mid-drag.
    const entries = validFiles.map(file => ({
      clientKey: `new-${Date.now()}-${(nextClientKeyRef.current += 1)}`,
      file
    }))

    const newImageItems: SortableImageItem[] = entries.map(({ clientKey, file }) => ({
      clientKey,
      file,
      originalFile: file,
      framing: DEFAULT_FRAMING,
      preview: URL.createObjectURL(file),
      isExisting: false,
      description: file.name,
      status: 'processing'
    }))

    setImagesWithPreviews(previous => [...previous, ...newImageItems])
    event.target.value = ''

    enqueueImageProcessing(entries, applyProcessingResult)
  }

  // Shared by the initial pick (above) and "Ajustar" reprocessing a single item with a new
  // framing (below) — same merge, same rules either way.
  const applyProcessingResult = (result: QueueItemResult) => {
    setImagesWithPreviews(previous =>
      previous.map(item => {
        if (item.clientKey !== result.clientKey) return item

        if (result.status === 'failed') {
          // Keep the current preview alive (don't revoke it) — the card still needs to show
          // what was picked next to the error. `file` stays untouched, but `onSubmit` below
          // excludes anything `failed` from the upload; the person removes the card or picks
          // a different photo instead.
          toast({ title: result.failureMessage ?? 'Não foi possível preparar a imagem.', status: 'error' })
          return { ...item, status: 'failed' as const, failureMessage: result.failureMessage }
        }

        // Ready: the previous preview (the placeholder, or the framing being replaced by
        // "Ajustar") is no longer needed once the new one takes its place.
        if (item.preview.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview)
        }

        if (result.fallbackWarning) {
          toast({ title: result.fallbackWarning, status: 'warning' })
        }

        return {
          ...item,
          file: result.file,
          preview: result.preview ?? item.preview,
          savings: result.savings,
          framing: result.framing ?? item.framing,
          status: 'ready' as const,
          failureMessage: undefined
        }
      })
    )
  }

  const handleAdjustImage = (clientKey: string, framing: Framing) => {
    const item = imagesWithPreviews.find(current => current.clientKey === clientKey)
    if (!item?.originalFile) return

    setImagesWithPreviews(previous =>
      previous.map(current => (current.clientKey === clientKey ? { ...current, status: 'processing' as const } : current))
    )

    enqueueImageProcessing([{ clientKey, file: item.originalFile, framing }], applyProcessingResult)
  }

  const removeImage = (index: number) => {
    const item = imagesWithPreviews[index]

    if (item.preview.startsWith('blob:')) {
      URL.revokeObjectURL(item.preview)
    }

    setImagesWithPreviews(previous =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    )
  }

  const hasProcessingImages = imagesWithPreviews.some(item => item.status === 'processing')

  const onSubmit = async (data: ProductDto) => {
    // Defensive: the button above is already disabled while images are processing, but this
    // guards against any other path into `onSubmit` (e.g. Enter key on a form field) beating it.
    if (hasProcessingImages) {
      toast({ title: 'Aguarde a preparação das imagens terminar.', status: 'error' })
      return
    }

    setIsSubmitting(true)

    try {
      const newPhotoUrls: Partial<ProductPhoto>[] = []
      // `failed` items (not-an-image, too small, unsupported format) never had a usable
      // treated file to begin with — they stay visible on the card with their error, but
      // don't get uploaded silently.
      const newImages = imagesWithPreviews.filter(
        item => !item.isExisting && item.file && item.status !== 'failed'
      )

      for (const item of newImages) {
        try {
          if (!item.file) continue

          const url = await uploadFileToAws(item.file)

          newPhotoUrls.push({
            url,
            description: item.description,
            ...(product && { productId: product.id })
          })
        } catch {
          toast({
            title: `Falha ao fazer upload do arquivo: ${item.description}`,
            status: 'error'
          })
          return
        }
      }

      const existingPhotos = imagesWithPreviews
        .filter(item => item.isExisting && item.photoId)
        .map(item => ({
          id: item.photoId,
          url: item.preview,
          description: item.description,
          ...(product && { productId: product.id })
        }))

      const actionDto = {
        ...data,
        widthUnit: selectedDimensionUnit,
        heightUnit: selectedDimensionUnit,
        lengthUnit: selectedDimensionUnit,
        thicknessUnit: selectedDimensionUnit,
        weightUnit: selectedWeightUnit,
        photos: [...existingPhotos, ...newPhotoUrls]
      }

      const response = product
        ? await updateProductAction(companyId, product.id, actionDto)
        : await createProductAction(companyId, actionDto)

      if (isApiErrorResponse(response)) {
        throw new Error(response.message)
      }

      toast({
        title: product
          ? 'Produto atualizado com sucesso'
          : 'Produto adicionado ao catálogo',
        status: 'success'
      })

      router.push(`/company/${companyId}/products`)

      actionDto.photos.forEach((photo: Partial<ProductPhoto>) => {
        if (photo.url?.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url)
        }
      })
    } catch (error: any) {
      toast({
        title:
          error?.message ??
          (product ? 'Erro ao atualizar produto' : 'Erro ao criar produto'),
        status: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const SaveButton = ({
    compact = false
  }: {
    compact?: boolean
  }) => (
    <Button
      type='button'
      onClick={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || hasProcessingImages}
      title={hasProcessingImages ? 'Aguarde a preparação das imagens terminar' : undefined}
      className={`gap-2 rounded-xl bg-[#008440] font-semibold text-white shadow-sm hover:bg-[#007538] ${
        compact ? 'h-10 px-4' : 'h-11 px-5'
      }`}
    >
      {isSubmitting ? (
        <>
          <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
          Salvando...
        </>
      ) : (
        <>
          <Save className='h-4 w-4' />
          Salvar produto
        </>
      )}
    </Button>
  )

  return (
    <div className='relative min-w-0 flex-1 bg-app pb-24'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-gradient-to-b from-[#EEF9F0] via-[#F7F9F8] to-transparent'
      />

      <div className='relative z-10 mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7'>
        <header className='relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-surface)] px-5 py-5 shadow-sm backdrop-blur-sm sm:px-6'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#35DD48]/15 blur-3xl'
          />

          <div className='relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-start gap-3 sm:gap-4'>
              <Link href={`/company/${companyId}/products`}>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='h-11 w-11 shrink-0 rounded-xl border-border bg-surface text-text-body'
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
              </Link>

              <div className='min-w-0'>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#008440]'>
                  {product ? 'Edição de catálogo' : 'Cadastro de catálogo'}
                </p>

                <h1 className='mt-1 flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-text sm:text-3xl'>
                  {product ? 'Editar Produto' : 'Novo Produto'}

                  {product && (
                    <span className='rounded-full bg-surface-muted px-2.5 py-1 font-mono text-xs font-semibold text-text-muted'>
                      #{product.id.toString().padStart(4, '0')}
                    </span>
                  )}
                </h1>

                <p className='mt-1 max-w-2xl truncate text-sm text-text-muted sm:text-base'>
                  {product?.name ||
                    'Cadastre as informações comerciais, fiscais e logísticas do produto.'}
                </p>
              </div>
            </div>

            <div
              ref={headerSaveRef}
              className='shrink-0'
            >
              <SaveButton />
            </div>
          </div>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <Collapsible.Root defaultOpen>
              <Card className='overflow-hidden rounded-3xl border-border shadow-sm'>
                <SectionHeader
                  icon={<FileText className='h-4 w-4' />}
                  title='Informações principais'
                  description='Dados comerciais e identificação básica do produto.'
                />

                <Collapsible.Content>
                  <CardContent className='border-t border-border px-5 py-5 sm:px-6'>
                    <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
                      <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                          <FormItem className='xl:col-span-6'>
                            <FormLabel>Nome do produto*</FormLabel>
                            <FormControl>
                              <Input className='h-11 rounded-xl' placeholder='Nome do produto' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='brand'
                        render={({ field }) => (
                          <FormItem className='xl:col-span-3'>
                            <FormLabel>Marca</FormLabel>
                            <FormControl>
                              <Input className='h-11 rounded-xl' placeholder='Marca' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='model'
                        render={({ field }) => (
                          <FormItem className='xl:col-span-3'>
                            <FormLabel>Modelo</FormLabel>
                            <FormControl>
                              <Input className='h-11 rounded-xl' placeholder='Modelo' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='videoUrl'
                        render={({ field }) => (
                          <FormItem className='xl:col-span-6'>
                            <FormLabel>Vídeo do produto</FormLabel>
                            <FormControl>
                              <Input
                                className='h-11 rounded-xl'
                                placeholder='Cole um link do YouTube, Vimeo ou Google Drive'
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='description'
                        render={({ field }) => (
                          <FormItem className='xl:col-span-12'>
                            <FormLabel>Descrição*</FormLabel>
                            <FormControl>
                              <TiptapEditor
                                value={field.value}
                                onChange={field.onChange}
                                placeholder='Descrição detalhada do produto'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className='xl:col-span-3'>
                        <FormField
                          control={form.control}
                          name='price'
                          render={({ field }) => (
                            <InputCurrency
                              label='Preço'
                              placeholder='Preço do produto'
                              {...field}
                              onChange={event => field.onChange(event.target.value)}
                            />
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name='reference'
                        render={({ field }) => (
                          <FormItem className='xl:col-span-3'>
                            <FormLabel>Referência</FormLabel>
                            <FormControl>
                              <Input className='h-11 rounded-xl' placeholder='Código de referência' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='supplierCode'
                        render={({ field }) => (
                          <FormItem className='xl:col-span-3'>
                            <FormLabel>Código do fornecedor</FormLabel>
                            <FormControl>
                              <Input className='h-11 rounded-xl' placeholder='Código do fornecedor' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='colors'
                        render={({ field }) => (
                          <FormItem className='xl:col-span-3'>
                            <FormLabel>Cores</FormLabel>
                            <FormControl>
                              <Input className='h-11 rounded-xl' placeholder='Cores disponíveis' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='subCategoryIds'
                        render={({ field }) => (
                          <FormItem className='xl:col-span-12'>
                            <FormLabel>Subcategorias</FormLabel>
                            <MultiSelect
                              options={allSubcategories}
                              onValueChange={value => field.onChange(value.map(Number))}
                              defaultValue={field?.value?.map(String)}
                              placeholder='Selecione as subcategorias'
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='favorite'
                        render={({ field }) => (
                          <FormItem className='flex items-start gap-3 rounded-2xl border border-border bg-surface-muted/70 p-4 xl:col-span-6'>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className='mt-0.5'
                              />
                            </FormControl>

                            <div className='space-y-1'>
                              <FormLabel className='flex items-center gap-2'>
                                <Star className='h-4 w-4 text-warning-foreground' />
                                Capa da loja
                              </FormLabel>

                              <FormDescription>
                                Destaque este produto na vitrine da loja.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='active'
                        render={({ field }) => (
                          <FormItem className='flex items-start gap-3 rounded-2xl border border-border bg-surface-muted/70 p-4 xl:col-span-6'>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className='mt-0.5'
                              />
                            </FormControl>

                            <div className='space-y-1'>
                              <FormLabel className='flex items-center gap-2'>
                                <Package className='h-4 w-4 text-[#008440]' />
                                Produto ativo
                              </FormLabel>

                              <FormDescription>
                                Produtos inativos não aparecem na loja nem podem ser adicionados a pedidos.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Collapsible.Content>
              </Card>
            </Collapsible.Root>

            <Collapsible.Root defaultOpen>
              <Card className='overflow-hidden rounded-3xl border-border shadow-sm'>
                <SectionHeader
                  icon={<Ruler className='h-4 w-4' />}
                  title='Dimensões e logística'
                  description='Unidade de medida, dimensões, peso e fabricante.'
                />

                <Collapsible.Content>
                  <CardContent className='border-t border-border px-5 py-5 sm:px-6'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
                      <FormField
                        control={form.control}
                        name='unitOfMeasure'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade de medida</FormLabel>
                            <FormControl>
                              <Input className='h-11 rounded-xl' placeholder='Ex: un, kg, m' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(
                        [
                          ['width', 'Largura'],
                          ['height', 'Altura'],
                          ['length', 'Comprimento'],
                          ['thickness', 'Espessura']
                        ] as const
                      ).map(([name, label]) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{label}</FormLabel>
                              <FormControl>
                                <div className='flex h-11 items-center rounded-xl border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring/20'>
                                  <Input
                                    placeholder='0,00'
                                    {...field}
                                    className='h-auto border-0 p-0 shadow-none focus-visible:ring-0'
                                  />

                                  <UnitField
                                    value={selectedDimensionUnit}
                                    onChange={setSelectedDimensionUnit}
                                    options={[
                                      { value: DimensionUnit.Millimeter, label: 'mm' },
                                      { value: DimensionUnit.Centimeter, label: 'cm' },
                                      { value: DimensionUnit.Meter, label: 'm' }
                                    ]}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}

                      <FormField
                        control={form.control}
                        name='netWeight'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso líquido</FormLabel>
                            <FormControl>
                              <div className='flex h-11 items-center rounded-xl border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring/20'>
                                <Input
                                  placeholder='0,000'
                                  {...field}
                                  className='h-auto border-0 p-0 shadow-none focus-visible:ring-0'
                                />

                                <UnitField
                                  value={selectedWeightUnit}
                                  onChange={setSelectedWeightUnit}
                                  options={[
                                    { value: WeightUnit.Gram, label: 'g' },
                                    { value: WeightUnit.Kilogram, label: 'kg' }
                                  ]}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='manufacturer'
                        render={({ field }) => (
                          <FormItem className='md:col-span-2 xl:col-span-2'>
                            <FormLabel>Fabricante / fornecedor</FormLabel>
                            <FormControl>
                              <Input
                                className='h-11 rounded-xl'
                                placeholder='Nome do fabricante ou fornecedor'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Collapsible.Content>
              </Card>
            </Collapsible.Root>

            <Collapsible.Root defaultOpen>
              <Card className='overflow-hidden rounded-3xl border-border shadow-sm'>
                <SectionHeader
                  icon={<Barcode className='h-4 w-4' />}
                  title='Informações fiscais'
                  description='NCM, código de barras e tributação do produto.'
                />

                <Collapsible.Content>
                  <CardContent className='border-t border-border px-5 py-5 sm:px-6'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5'>
                      <FormField
                        control={form.control}
                        name='ncm'
                        render={({ field }) => (
                          <FormItem className='xl:col-span-2'>
                            <FormLabel>NCM</FormLabel>
                            <FormControl>
                              <Input
                                className='h-11 rounded-xl'
                                placeholder='Código NCM'
                                maxLength={8}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Código com 8 dígitos.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='barcode'
                        render={({ field }) => (
                          <FormItem className='xl:col-span-2'>
                            <FormLabel>Código de barras</FormLabel>
                            <FormControl>
                              <Input
                                className='h-11 rounded-xl'
                                placeholder='EAN-13 ou DUN-14'
                                maxLength={14}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(
                        [
                          ['icms', 'ICMS'],
                          ['ipi', 'IPI'],
                          ['st', 'ST']
                        ] as const
                      ).map(([name, label]) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{label}</FormLabel>
                              <FormControl>
                                <div className='relative'>
                                  <span className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-text-muted'>
                                    %
                                  </span>

                                  <Input
                                    className='h-11 rounded-xl pl-8'
                                    placeholder={label}
                                    {...field}
                                    onChange={formatPercentageValue(field.onChange)}
                                    value={field.value === 0 ? '' : field.value}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Collapsible.Content>
              </Card>
            </Collapsible.Root>

            <Collapsible.Root defaultOpen>
              <Card className='overflow-hidden rounded-3xl border-border shadow-sm'>
                <SectionHeader
                  icon={<ImagePlus className='h-4 w-4' />}
                  title='Imagens do produto'
                  description='Adicione fotos do produto para catálogo, loja e equipe comercial.'
                />

                <Collapsible.Content>
                  <CardContent className='border-t border-border px-5 py-5 sm:px-6'>
                    <div className='grid gap-5 xl:grid-cols-[320px_1fr]'>
                      <label
                        htmlFor='image-upload'
                        className='flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-strong bg-surface-muted/70 px-5 text-center transition-colors hover:border-[var(--glass-hover-border)] hover:bg-[var(--glass-hover-bg)]'
                      >
                        <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-[#008440] shadow-sm'>
                          <Upload className='h-5 w-5' />
                        </div>

                        <p className='mt-3 text-sm font-semibold text-text-body'>
                          Adicionar imagens
                        </p>

                        <p className='mt-1 text-xs leading-5 text-text-muted'>
                          PNG, JPG ou WEBP
                          <br />
                          até 5MB por imagem
                        </p>

                        <Input
                          id='image-upload'
                          type='file'
                          accept='image/*'
                          multiple
                          className='hidden'
                          onChange={handleImageUpload}
                        />
                      </label>

                      <div className='min-w-0'>
                        <div className='mb-3 flex items-center justify-between gap-3'>
                          <div>
                            <p className='text-sm font-semibold text-text-body'>
                              Imagens carregadas
                            </p>

                            <p className='text-xs text-text-muted'>
                              {imagesWithPreviews.length}{' '}
                              {imagesWithPreviews.length === 1 ? 'imagem' : 'imagens'}
                              {imagesWithPreviews.length > 1 &&
                                ' · arraste para reordenar, a primeira é a capa'}
                            </p>
                          </div>
                        </div>

                        {imagesWithPreviews.length > 0 ? (
                          <SortableProductImages
                            images={imagesWithPreviews}
                            onReorder={setImagesWithPreviews}
                            onRemove={removeImage}
                            onAdjust={handleAdjustImage}
                          />
                        ) : (
                          <div className='flex min-h-[190px] items-center justify-center rounded-2xl border border-border bg-surface px-5 text-center'>
                            <div>
                              <Box className='mx-auto h-6 w-6 text-text-muted' />

                              <p className='mt-2 text-sm font-medium text-text-muted'>
                                Nenhuma imagem carregada
                              </p>

                              <p className='mt-1 text-xs text-text-muted'>
                                Use a área ao lado para adicionar imagens.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Collapsible.Content>
              </Card>
            </Collapsible.Root>
          </form>
        </Form>
      </div>

      {mounted &&
        !isHeaderSaveVisible &&
        createPortal(
          <div className='fixed inset-x-0 bottom-0 z-[9999] border-t border-border bg-surface/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:left-auto md:right-6 md:bottom-6 md:w-auto md:rounded-2xl md:border md:p-2'>
            <div className='mx-auto flex max-w-[1500px] items-center justify-end md:mx-0'>
              <div className='w-full md:w-auto'>
                <SaveButton compact />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
