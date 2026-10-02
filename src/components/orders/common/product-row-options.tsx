import { Row } from '@tanstack/react-table'
import { Minus, Plus, Trash } from 'lucide-react'
import { Button } from '../../ui/button'

interface RowOptionsProps {
  row: Row<{
    productId: number
    quantity: number
  }>
  adjustQuantity: (index: number, quantity: number) => void
  handleRemoveProduct: (index: number) => void
}

export function ProductRowOptions({ row, adjustQuantity, handleRemoveProduct }: RowOptionsProps) {
  return (
    <div className='flex justify-center gap-2'>
      <Button type='button' size='sm' variant='outline' onClick={() => adjustQuantity(row.index, -1)}>
        <Minus />
      </Button>
      <Button type='button' size='sm' variant='outline' onClick={() => adjustQuantity(row.index, 1)}>
        <Plus />
      </Button>
      <Button type='button' variant='destructive' size='sm' onClick={() => handleRemoveProduct(row.index)}>
        <Trash />
      </Button>
    </div>
  )
}
