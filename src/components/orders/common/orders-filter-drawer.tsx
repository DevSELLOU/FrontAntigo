'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdvancedFilter } from '@/components/admin/advanced-filter'
import { FilterDrawer } from '@/components/shared/filter-drawer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderWrapper } from '@/types/order-wrapper.type'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'

const MONTHS = [
  { value: '0', label: 'Todos os meses' },
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
]

interface OrdersFilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderWrapper: OrderWrapper
  fields: FilterField[]
}

export function OrdersFilterDrawer({ open, onOpenChange, orderWrapper, fields }: OrdersFilterDrawerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentYear = new Date().getFullYear()

  const existingYears = useMemo(() => {
    const years = new Set<number>()
    orderWrapper.orders?.forEach(order => {
      if (order.createdAt) {
        years.add(new Date(order.createdAt).getFullYear())
      }
    })
    years.add(currentYear)
    return Array.from(years).sort((a, b) => b - a)
  }, [orderWrapper.orders, currentYear])

  const getFilters = () => {
    const existingFilters = searchParams.get('filters')
    let filtersObj: Record<string, unknown> = {}
    if (existingFilters) {
      try {
        filtersObj = JSON.parse(existingFilters)
      } catch {
        filtersObj = {}
      }
    }
    return filtersObj
  }

  const currentFilters = getFilters()
  const selectedYear = currentFilters.year?.toString() || currentYear.toString()
  const selectedMonth = currentFilters.month?.toString() || '0'

  const updateFilters = (year: string, month: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '1')

    const filtersObj = getFilters()
    filtersObj.year = parseInt(year)
    filtersObj.month = parseInt(month)
    params.set('filters', JSON.stringify(filtersObj))

    router.push('?' + params.toString())
  }

  return (
    <FilterDrawer
      open={open}
      onOpenChange={onOpenChange}
      title='Filtrar pedidos'
      subtitle='Refine por período e condições específicas.'
    >
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-2'>
          <label className='text-label text-text-body'>Mês</label>
          <Select value={selectedMonth} onValueChange={month => updateFilters(selectedYear, month)}>
            <SelectTrigger>
              <SelectValue placeholder='Mês' />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <label className='text-label text-text-body'>Ano</label>
          <Select value={selectedYear} onValueChange={year => updateFilters(year, selectedMonth)}>
            <SelectTrigger>
              <SelectValue placeholder='Ano' />
            </SelectTrigger>
            <SelectContent>
              {existingYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AdvancedFilter fields={fields} embedded />
    </FilterDrawer>
  )
}
