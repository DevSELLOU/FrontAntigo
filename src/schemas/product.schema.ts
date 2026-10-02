import { z } from 'zod'
import { parseVideoUrl } from '@/utils/parse-video-url.util'

const optionalString = (refine?: (value: string | undefined) => boolean, message?: string) => {
  const baseSchema = z
    .union([z.string(), z.null()])
    .optional()
    .transform(value => (value === '' || value === null ? undefined : value))

  if (refine) {
    return baseSchema.refine(refine, { message })
  }

  return baseSchema
}

const percentageNumber = (message: string) =>
  z
    .union([z.string(), z.number()])
    .transform(value => (typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value))
    .refine(value => !isNaN(value) && value >= 0 && value <= 100, { message })

const brazilianDimensionNumber = (message: string) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform(value => (value === '' || value === null ? undefined : value))
    .refine(value => {
      if (value === undefined) return true
      const str = String(value)
      const regex = /^-?(\d{1,3}(\.\d{3})*(,\d+)?|\d+(,\d+)?)$/
      return regex.test(str) || str.match(/^\d+$/) !== null
    }, { message })
    .transform(value => (value !== undefined ? value : undefined))

export const ProductSchema = z.object({
  name: z.string().min(2, { message: 'Nome é obrigatório' }).max(255, { message: 'Nome deve ter no máximo 255 caracteres' }),
  description: z.string().min(2, { message: 'Descrição é obrigatória' }).max(3000, { message: 'Descrição deve ter no máximo 3000 caracteres' }),
  price: z.number().positive({ message: 'Preço é obrigatório' }),
  subCategoryIds: z.array(z.number({ message: 'Subcategorias inválidas' })).optional(),
  colors: optionalString(),
  brand: optionalString(),
  unitOfMeasure: optionalString(),
  
  width: brazilianDimensionNumber('Largura inválida'),
  height: brazilianDimensionNumber('Altura inválida'),
  length: brazilianDimensionNumber('Comprimento inválido'),
  netWeight: brazilianDimensionNumber('Peso líquido inválido'),
  thickness: brazilianDimensionNumber('Espessura inválida'),
  
  widthUnit: optionalString(),
  heightUnit: optionalString(),
  lengthUnit: optionalString(),
  weightUnit: optionalString(),
  thicknessUnit: optionalString(),
  
  ncm: optionalString(value => value === undefined || value.length === 8, 'NCM inválido'),
  reference: optionalString(),
  supplierCode: optionalString(),
  model: optionalString(),
  // Validated against the same parser the storefront uses, so an unsupported link is caught while
  // the seller is still looking at the field instead of silently rendering nothing on the shop.
  videoUrl: optionalString(
    value => value === undefined || parseVideoUrl(value) !== null,
    'Use um link público do YouTube, Vimeo ou Google Drive'
  ),
  ipi: percentageNumber('IPI é obrigatório e deve ser um percentual entre 0 e 100'),
  st: percentageNumber('ST é obrigatório e deve ser um percentual entre 0 e 100'),
  barcode: z
    .string()
    .refine(value => value.length === 13 || value.length === 14, {
      message: 'Código de barras deve ter 13 (EAN-13) ou 14 (DUN-14) dígitos'
    })
    .refine(value => /^\d+$/.test(value), { message: 'Código de barras deve conter apenas números' }),
  manufacturer: z.string().min(1, { message: 'Fabricante/fornecedor é obrigatório' }),
  icms: percentageNumber('ICMS é obrigatório e deve ser um percentual entre 0 e 100'),
  favorite: z.boolean().optional(),
  active: z.boolean().optional()
})