'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Product } from '@/interfaces/product.interface'
import { formatCurrency } from '@/utils/format/format-currency'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'
import { Barcode, Box, ImageOff, Ruler, Tag } from 'lucide-react'
import Image from 'next/image'

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

/** Chip used for categories — brand tint, same shape as the status capsules. */
const chipClassName =
  'rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-caption font-semibold text-brand-700'

function DetailField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className='text-xs text-text-muted'>{label}</p>
      <p className='mt-1 font-medium text-text-body'>{value || 'Não especificado'}</p>
    </div>
  )
}

export function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[92vh] overflow-hidden rounded-3xl border-border p-0 sm:max-w-2xl'>
        <DialogHeader className='border-b border-border bg-surface-muted/70 px-5 py-5 text-left sm:px-6'>
          <DialogTitle className='text-xl font-bold text-text'>{product.name}</DialogTitle>
          <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1'>
            <span className='text-lg font-bold tabular-nums text-[#008440]'>{formatCurrency(product.price)}</span>
            <span className='text-caption text-text-muted'>Estoque: {product.stock || 'Sem estoque'}</span>
          </div>
        </DialogHeader>

        <div className='max-h-[calc(92vh-190px)] overflow-y-auto px-5 py-5 sm:px-6'>
          <div className='space-y-6'>
            <div className='flex flex-wrap items-center gap-4'>
              {product?.photos?.length > 0 ? (
                product.photos.map((photo, index) => (
                  <Image
                    key={index}
                    src={photo.url}
                    width={200}
                    height={200}
                    alt={photo.description || product.name}
                    className='h-[200px] w-[200px] rounded-2xl border border-border object-cover'
                    unoptimized={true}
                  />
                ))
              ) : (
                <div className='flex h-[200px] w-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface-muted p-2 text-center text-caption text-text-muted'>
                  <ImageOff className='h-5 w-5' />
                  Sem imagem
                </div>
              )}
            </div>

            <Separator />

            <section className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                <Box className='h-5 w-5 text-[#008440]' />
                Informações do produto
              </h3>

              <div className='grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2'>
                <DetailField label='Referência' value={product.reference} />
                <DetailField label='Modelo' value={product.model} />
                <DetailField label='Marca' value={product.brand} />
                <DetailField label='NCM' value={product.ncm} />
                <DetailField label='Unidade de medida' value={product.unitOfMeasure} />
                <DetailField label='Estoque' value={product.stock || 'Sem estoque'} />
                <DetailField label='Cores' value={product.colors} />
                <DetailField label='Código do fornecedor' value={product.supplierCode} />
              </div>
            </section>

            <Separator />

            <section className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                <Ruler className='h-5 w-5 text-[#008440]' />
                Dimensões e peso
              </h3>

              <div className='grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2'>
                <DetailField label='Altura' value={product.height} />
                <DetailField label='Largura' value={product.width} />
                <DetailField label='Comprimento' value={product.length} />
                <DetailField label='Espessura' value={product.thickness} />
                <DetailField label='Peso líquido' value={product.netWeight} />
              </div>
            </section>

            <Separator />

            <section className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                <Barcode className='h-5 w-5 text-[#008440]' />
                Informações fiscais
              </h3>

              <div className='grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2'>
                <DetailField label='IPI' value={product.ipi ? `${product.ipi}%` : ''} />
                <DetailField label='ST' value={product.st ? `${product.st}%` : ''} />
                <DetailField label='ICMS' value={product.icms ? `${product.icms}%` : ''} />
                <DetailField label='Código de barras' value={product.barcode} />
                <DetailField label='Fabricante/fornecedor' value={product.manufacturer} />
              </div>
            </section>

            <Separator />

            <section className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-text'>
                <Tag className='h-5 w-5 text-[#008440]' />
                Categorias
              </h3>

              {product.subCategories && product.subCategories.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {product.subCategories.map((subCategory, index) => (
                    <span key={index} className={chipClassName}>
                      {subCategory.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className='text-caption text-text-muted'>Nenhuma categoria especificada</p>
              )}
            </section>

            <Separator />

            <section className='space-y-3'>
              <h3 className='text-lg font-semibold text-text'>Descrição</h3>

              {product.description ? (
                <div className='prose prose-sm max-w-none text-body text-text-body'>
                  {parse(DOMPurify.sanitize(product.description))}
                </div>
              ) : (
                <p className='text-caption text-text-muted'>Sem descrição</p>
              )}
            </section>
          </div>
        </div>

        <div className='flex justify-end border-t border-border bg-surface-muted/70 px-5 py-4 sm:px-6'>
          <Button variant='outline' className='rounded-xl' onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
