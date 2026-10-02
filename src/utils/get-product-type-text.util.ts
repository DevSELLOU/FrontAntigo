import { ProductStockType } from '@/enums/product-stock-type.enum'

export function getProductStockTypeText(type: ProductStockType): string {
  return {
    IN: 'Entrada',
    OUT: 'Saída'
  }[type]
}
