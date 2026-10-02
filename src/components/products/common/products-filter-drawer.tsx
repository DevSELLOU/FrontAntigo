'use client'

import { AdvancedFilter } from '@/components/admin/advanced-filter'
import { FilterDrawer } from '@/components/shared/filter-drawer'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'

interface ProductsFilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fields: FilterField[]
}

export function ProductsFilterDrawer({ open, onOpenChange, fields }: ProductsFilterDrawerProps) {
  return (
    <FilterDrawer
      open={open}
      onOpenChange={onOpenChange}
      title='Filtrar produtos'
      subtitle='Refine por categoria, preço e outras condições.'
    >
      <AdvancedFilter fields={fields} embedded />
    </FilterDrawer>
  )
}
