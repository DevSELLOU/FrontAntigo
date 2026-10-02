'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Category } from '@/interfaces/category.interface'
import { Product } from '@/interfaces/product.interface'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/format/format-currency'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'
import {
    Barcode,
    Box,
    Boxes,
    ChevronLeft,
    ChevronRight,
    Edit,
    FileText,
    ImageOff,
    Package,
    Ruler,
    Tag,
    Trash2,
    Warehouse
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { InsertProductStockModal } from './insert-product-stock-modal'

const RemoveProductModal =
  dynamic(() =>
    import(
      './remove-product-modal'
    ).then(
      mod => mod.RemoveProductModal
    )
  )

const StockMovementsModal =
  dynamic(() =>
    import(
      './stock-movements-modal'
    ).then(
      mod =>
        mod.StockMovementsModal
    )
  )

interface ProductViewModalProps {
  open: boolean
  onClose: () => void
  product: Product
  categories: Category[]
}

function renderValue(
  value:
    | string
    | number
    | null
    | undefined,
  suffix = ''
) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '-'
  }

  return `${value}${suffix}`
}

export function ProductViewModal({
  open,
  onClose,
  product
}: ProductViewModalProps) {
  const router = useRouter()

  const [
    isStockModalOpen,
    setIsStockModalOpen
  ] = useState(false)

  const [
    isStockMovementsModalOpen,
    setIsStockMovementsModalOpen
  ] = useState(false)

  const [
    isRemoveModalOpen,
    setIsRemoveModalOpen
  ] = useState(false)

  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  const photos = product.photos ?? []
  const activePhoto = photos[activePhotoIndex]

  const showPreviousPhoto = () =>
    setActivePhotoIndex(index => (index === 0 ? photos.length - 1 : index - 1))

  const showNextPhoto = () =>
    setActivePhotoIndex(index => (index === photos.length - 1 ? 0 : index + 1))

  const handleEdit = () => {
    onClose()

    router.push(
      `/company/${product.companyId}/products/edit/${product.id}`
    )
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            onClose()
          }
        }}
      >
        <DialogContent className='max-h-[92vh] overflow-hidden rounded-3xl border-border p-0 sm:max-w-3xl'>
          <DialogHeader className='border-b border-border bg-surface-muted/70 px-5 py-5 text-left sm:px-6'>
            <div className='flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start'>
              <div className='relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-surface sm:w-56'>
                {activePhoto?.url ? (
                  <Image
                    key={activePhoto.url}
                    src={activePhoto.url}
                    alt={
                      activePhoto.description ||
                      product.name
                    }
                    fill
                    sizes='(min-width: 640px) 224px, 100vw'
                    className='object-cover'
                    unoptimized={true}
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center text-text-muted'>
                    <ImageOff className='h-5 w-5' />
                  </div>
                )}

                {photos.length > 1 && (
                  <>
                    <button
                      type='button'
                      onClick={showPreviousPhoto}
                      aria-label='Foto anterior'
                      className='absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-text shadow-sm backdrop-blur-sm hover:bg-surface'
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </button>

                    <button
                      type='button'
                      onClick={showNextPhoto}
                      aria-label='Próxima foto'
                      className='absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-text shadow-sm backdrop-blur-sm hover:bg-surface'
                    >
                      <ChevronRight className='h-4 w-4' />
                    </button>

                    <div className='absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5'>
                      {photos.map((photo, index) => (
                        <button
                          key={photo.id ?? index}
                          type='button'
                          onClick={() => setActivePhotoIndex(index)}
                          aria-label={`Ver foto ${index + 1}`}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full transition-all',
                            index === activePhotoIndex
                              ? 'w-4 bg-surface'
                              : 'bg-surface/60'
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <DialogTitle className='text-xl font-bold text-text'>
                    {product.name}
                  </DialogTitle>

                  <Badge
                    variant='outline'
                    className={
                      product.active ===
                      false
                        ? 'border-danger-border bg-danger text-danger-foreground'
                        : 'border-success-border bg-success text-success-foreground'
                    }
                  >
                    {product.active ===
                    false
                      ? 'Inativo'
                      : 'Ativo'}
                  </Badge>
                </div>

                <p className='mt-1 text-sm text-text-muted'>
                  {[product.brand, product.model]
                    .filter(Boolean)
                    .join(' ') || '-'}
                </p>

                <p className='mt-2 text-lg font-bold text-[#008440]'>
                  {formatCurrency(
                    product.price
                  )}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className='border-b border-border bg-surface px-5 py-3 sm:px-6'>
            <div className='flex items-center gap-2 overflow-x-auto pb-1'>
              <Button
                type='button'
                onClick={() =>
                  setIsStockModalOpen(
                    true
                  )
                }
                title='Movimentar estoque'
                aria-label='Movimentar estoque'
                className='h-9 w-9 shrink-0 gap-2 rounded-xl bg-[#008440] px-0 font-semibold text-white hover:bg-[#007538] sm:w-auto sm:px-4'
              >
                <Package className='h-4 w-4' />

                <span className='hidden sm:inline'>
                  Estoque
                </span>
              </Button>

              <Button
                type='button'
                variant='outline'
                onClick={handleEdit}
                title='Editar produto'
                aria-label='Editar produto'
                className='h-9 w-9 shrink-0 gap-2 rounded-xl px-0 sm:w-auto sm:px-4'
              >
                <Edit className='h-4 w-4' />

                <span className='hidden sm:inline'>
                  Editar
                </span>
              </Button>

              <Button
                type='button'
                variant='outline'
                onClick={() =>
                  setIsStockMovementsModalOpen(
                    true
                  )
                }
                title='Movimento'
                aria-label='Movimento'
                className='h-9 w-9 shrink-0 gap-2 rounded-xl px-0 sm:w-auto sm:px-4'
              >
                <Warehouse className='h-4 w-4' />

                <span className='hidden sm:inline'>
                  Movimento
                </span>
              </Button>

              <Button
                type='button'
                variant='outline'
                onClick={() =>
                  setIsRemoveModalOpen(
                    true
                  )
                }
                title='Excluir'
                aria-label='Excluir'
                className='h-9 w-9 shrink-0 gap-2 rounded-xl px-0 sm:w-auto sm:px-4'
              >
                <Trash2 className='h-4 w-4' />

                <span className='hidden sm:inline'>
                  Excluir
                </span>
              </Button>
            </div>
          </div>

          <div className='max-h-[calc(92vh-165px)] overflow-y-auto px-5 py-5 sm:px-6'>
            <div className='space-y-6'>
              <section className='space-y-3'>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                  <Box className='h-5 w-5 text-[#008440]' />
                  Produto
                </h3>

                <div className='grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2'>
                  <div>
                    <p className='text-xs text-text-muted'>
                      Referência
                    </p>

                    <p className='mt-1 font-medium text-text-body'>
                      {renderValue(
                        product.reference
                      )}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-text-muted'>
                      Código fornecedor
                    </p>

                    <p className='mt-1 font-medium text-text-body'>
                      {renderValue(
                        product.supplierCode
                      )}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-text-muted'>
                      Marca
                    </p>

                    <p className='mt-1 font-medium text-text-body'>
                      {renderValue(
                        product.brand
                      )}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-text-muted'>
                      Modelo
                    </p>

                    <p className='mt-1 font-medium text-text-body'>
                      {renderValue(
                        product.model
                      )}
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              <section className='space-y-3'>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                  <Boxes className='h-5 w-5 text-[#008440]' />
                  Estoque e comercial
                </h3>

                <div className='grid gap-3 sm:grid-cols-3'>
                  <div className='rounded-2xl border border-border bg-surface p-4'>
                    <p className='text-xs uppercase tracking-[0.08em] text-text-muted'>
                      Estoque atual
                    </p>

                    <p className='mt-1 text-lg font-bold text-text'>
                      {product.stock ||
                        '0'}
                    </p>
                  </div>

                  <div className='rounded-2xl border border-border bg-surface p-4'>
                    <p className='text-xs uppercase tracking-[0.08em] text-text-muted'>
                      Preço
                    </p>

                    <p className='mt-1 text-lg font-bold text-[#008440]'>
                      {formatCurrency(
                        product.price
                      )}
                    </p>
                  </div>

                  <div className='rounded-2xl border border-border bg-surface p-4'>
                    <p className='text-xs uppercase tracking-[0.08em] text-text-muted'>
                      Unidade
                    </p>

                    <p className='mt-1 text-lg font-bold text-text'>
                      {renderValue(
                        product.unitOfMeasure
                      )}
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              <section className='space-y-3'>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                  <Barcode className='h-5 w-5 text-[#008440]' />
                  Fiscal e identificação
                </h3>

                <div className='grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2'>
                  <div>
                    <p className='text-xs text-text-muted'>
                      NCM
                    </p>

                    <p className='mt-1 font-medium text-text-body'>
                      {renderValue(
                        product.ncm
                      )}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-text-muted'>
                      Código de barras
                    </p>

                    <p className='mt-1 break-all font-medium text-text-body'>
                      {renderValue(
                        product.barcode
                      )}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-text-muted'>
                      Fabricante
                    </p>

                    <p className='mt-1 font-medium text-text-body'>
                      {renderValue(
                        product.manufacturer
                      )}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-text-muted'>
                      IPI / ICMS / ST
                    </p>

                    <p className='mt-1 font-medium text-text-body'>
                      {renderValue(
                        product.ipi,
                        '%'
                      )}
                      {' · '}
                      {renderValue(
                        product.icms,
                        '%'
                      )}
                      {' · '}
                      {renderValue(
                        product.st,
                        '%'
                      )}
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              <section className='space-y-3'>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                  <Ruler className='h-5 w-5 text-[#008440]' />
                  Dimensões e peso
                </h3>

                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                  <div className='rounded-xl bg-surface-muted p-3'>
                    <p className='text-xs text-text-muted'>
                      Altura
                    </p>

                    <p className='mt-1 font-semibold text-text-body'>
                      {renderValue(
                        product.height,
                        product.heightUnit
                          ? ` ${product.heightUnit}`
                          : ''
                      )}
                    </p>
                  </div>

                  <div className='rounded-xl bg-surface-muted p-3'>
                    <p className='text-xs text-text-muted'>
                      Largura
                    </p>

                    <p className='mt-1 font-semibold text-text-body'>
                      {renderValue(
                        product.width,
                        product.widthUnit
                          ? ` ${product.widthUnit}`
                          : ''
                      )}
                    </p>
                  </div>

                  <div className='rounded-xl bg-surface-muted p-3'>
                    <p className='text-xs text-text-muted'>
                      Comprimento
                    </p>

                    <p className='mt-1 font-semibold text-text-body'>
                      {renderValue(
                        product.length,
                        product.lengthUnit
                          ? ` ${product.lengthUnit}`
                          : ''
                      )}
                    </p>
                  </div>

                  <div className='rounded-xl bg-surface-muted p-3'>
                    <p className='text-xs text-text-muted'>
                      Espessura
                    </p>

                    <p className='mt-1 font-semibold text-text-body'>
                      {renderValue(
                        product.thickness,
                        product.thicknessUnit
                          ? ` ${product.thicknessUnit}`
                          : ''
                      )}
                    </p>
                  </div>

                  <div className='rounded-xl bg-surface-muted p-3'>
                    <p className='text-xs text-text-muted'>
                      Peso líquido
                    </p>

                    <p className='mt-1 font-semibold text-text-body'>
                      {renderValue(
                        product.netWeight,
                        product.weightUnit
                          ? ` ${product.weightUnit}`
                          : ''
                      )}
                    </p>
                  </div>

                  <div className='rounded-xl bg-surface-muted p-3'>
                    <p className='text-xs text-text-muted'>
                      Cores
                    </p>

                    <p className='mt-1 font-semibold text-text-body'>
                      {renderValue(
                        product.colors
                      )}
                    </p>
                  </div>
                </div>
              </section>

              {product.subCategories
                ?.length ? (
                <>
                  <Separator />

                  <section className='space-y-3'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                      <Tag className='h-5 w-5 text-[#008440]' />
                      Categorias
                    </h3>

                    <div className='flex flex-wrap gap-2'>
                      {product.subCategories.map(
                        subCategory => (
                          <Badge
                            key={
                              subCategory.id
                            }
                            variant='secondary'
                            className='rounded-full px-3 py-1'
                          >
                            {
                              subCategory.name
                            }
                          </Badge>
                        )
                      )}
                    </div>
                  </section>
                </>
              ) : null}

              {product.description ? (
                <>
                  <Separator />

                  <section className='space-y-3'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                      <FileText className='h-5 w-5 text-[#008440]' />
                      Descrição
                    </h3>

                    <div className='rounded-2xl bg-surface-muted p-4 text-sm leading-6 text-text-body prose prose-sm max-w-none [&_p]:m-0'>
                      {parse(DOMPurify.sanitize(product.description))}
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isStockModalOpen && (
        <InsertProductStockModal
          open={isStockModalOpen}
          onClose={() =>
            setIsStockModalOpen(
              false
            )
          }
          product={product}
        />
      )}

      {isStockMovementsModalOpen && (
        <StockMovementsModal
          open={
            isStockMovementsModalOpen
          }
          onClose={() =>
            setIsStockMovementsModalOpen(
              false
            )
          }
          product={product}
        />
      )}

      {isRemoveModalOpen && (
        <RemoveProductModal
          open={isRemoveModalOpen}
          onClose={() =>
            setIsRemoveModalOpen(
              false
            )
          }
          product={product}
        />
      )}
    </>
  )
}
