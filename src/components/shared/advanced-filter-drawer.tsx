'use client'

import { AdvancedFilter } from '@/components/admin/advanced-filter'
import { FilterDrawer } from '@/components/shared/filter-drawer'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'

interface AdvancedFilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fields: FilterField[]
  title?: string
  subtitle?: string
}

/**
 * Generic drawer around `AdvancedFilter`, for listing screens whose filter needs are just
 * "field + operator + value" with no extra controls (unlike Orders, which injects month/year
 * selects and keeps its own wrapper). Used by Companies and Users.
 */
export function AdvancedFilterDrawer({ open, onOpenChange, fields, title, subtitle }: AdvancedFilterDrawerProps) {
  return (
    <FilterDrawer open={open} onOpenChange={onOpenChange} title={title} subtitle={subtitle}>
      <AdvancedFilter fields={fields} embedded />
    </FilterDrawer>
  )
}
