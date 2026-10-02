'use client'

import type React from 'react'

import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown, ChevronDown, ChevronUp, Plus, Search, Trash2, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useDelayedState } from '@/hooks/use-delayed-state'
import { cn } from '@/lib/utils'
import { FilterField } from '@/utils/advanced-filter/filter-fields'

interface AdvancedFilterProps {
  fields: FilterField[]
  embedded?: boolean
}

interface FilterCondition {
  field: string
  operator: string
  value: string
  sort?: 'asc' | 'desc' | null
}

function getFieldOperators(fieldType: string) {
  switch (fieldType) {
    case 'select':
      return operators.filter(op => ['eq', 'ne', 'in', 'nin'].includes(op.value))
    case 'date':
      return operators.filter(op => ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'].includes(op.value))
    case 'text':
    default:
      return operators.filter(op => ['eq', 'ne', 'like', 'iLike'].includes(op.value))
  }
}

const operators = [
  { value: 'eq', label: 'É igual a' },
  { value: 'ne', label: 'Não é igual a' },
  { value: 'gt', label: 'Maior que' },
  { value: 'gte', label: 'Maior ou igual a' },
  { value: 'lt', label: 'Menor que' },
  { value: 'lte', label: 'Menor ou igual a' },
  { value: 'like', label: 'Contém' },
  { value: 'iLike', label: 'Contém (ignorar maiúsculas/minúsculas)' },
  { value: 'in', label: 'Está na lista' },
  { value: 'nin', label: 'Não está na lista' }
]

export function AdvancedFilter({ fields, embedded = false }: AdvancedFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isCollapsed, setIsCollapsed] = useState(false)

  const [currentFilter, setCurrentFilter] = useState<FilterCondition>({
    field: fields[0]?.key || '',
    operator: 'eq',
    value: '',
    sort: null
  })

  const [query, setQuery, delayedQuery] = useDelayedState(searchParams.get('query') || '')

  const existingFilters = useMemo(() => {
    const filtersParam = searchParams.get('filters')
    const sortParam = searchParams.get('sort')
    if (!filtersParam) return []

    try {
      const parsed = JSON.parse(filtersParam)
      const sortParsed = sortParam ? JSON.parse(sortParam) : null

      const specialFilters = ['year', 'month']
      const entries = Object.entries(parsed).filter(([field]) => !specialFilters.includes(field))

      return entries.map(([field, condition]: [string, any]) => {
        const sortDirection =
          sortParsed && Object.keys(sortParsed)[0] === field ? (sortParsed[field] as 'asc' | 'desc') : null

        return {
          field,
          operator: Object.keys(condition)[0],
          value: condition[Object.keys(condition)[0]],
          sort: sortDirection
        }
      })
    } catch {
      return []
    }
  }, [searchParams])

  const updateURL = useCallback(
    (filters: FilterCondition[]) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))

      const filtersObject = filters.reduce(
        (acc, { field, operator, value }) => {
          acc[field] = { [operator]: value }
          return acc
        },
        {} as Record<string, Record<string, string>>
      )

      const sortFilter = filters.find(f => f.sort)

      if (filters.length > 0) {
        current.set('filters', JSON.stringify(filtersObject))
      } else {
        current.delete('filters')
      }

      if (sortFilter) {
        current.set('sort', JSON.stringify({ [sortFilter.field]: sortFilter.sort }))
      } else {
        // No filter chip carries its own sort. That doesn't necessarily mean sorting was
        // cleared — `sort` may have been set independently by clicking a table column header
        // (outside this component's control). Only drop it here when it belongs to one of the
        // conditions we're rewriting (its own sort selector was reset); otherwise preserve it.
        const currentSortParam = current.get('sort')
        let currentSortField: string | null = null
        if (currentSortParam) {
          try {
            currentSortField = Object.keys(JSON.parse(currentSortParam))[0] ?? null
          } catch {
            currentSortField = null
          }
        }

        const sortBelongsToRewrittenFilters =
          currentSortField !== null && filters.some(f => f.field === currentSortField)

        if (sortBelongsToRewrittenFilters) {
          current.delete('sort')
        }
      }

      if (delayedQuery) {
        current.set('query', delayedQuery)
      } else {
        current.delete('query')
      }

      if (!searchParams.has('page')) {
        current.set('page', '1')
      }

      router.push('?' + current.toString())
    },
    [router, searchParams, delayedQuery]
  )

  const addFilter = () => {
    if (currentFilter.field && currentFilter.value) {
      const selectedField = fields.find(f => f.key === currentFilter.field)
      let cleanedValue = currentFilter.value

      if (selectedField?.type === 'text') {
        cleanedValue = currentFilter.value.replace(/[^\p{L}\p{N}\s]/gu, '').trim()
        if (currentFilter.operator === 'like' || currentFilter.operator === 'iLike') {
          cleanedValue = `%${cleanedValue}%`
        }
      } else if (selectedField?.type === 'number') {
        cleanedValue = currentFilter.value.replace(/[^0-9.,]/g, '').replace(',', '.')
      }

      const newFilter: FilterCondition = { ...currentFilter, value: cleanedValue }
      const newFilters = [...existingFilters, newFilter]
      updateURL(newFilters)
      setCurrentFilter({
        field: fields[0]?.key || '',
        operator: 'eq',
        value: '',
        sort: null
      })
    }
  }
  const removeFilter = (index: number) => {
    const newFilters = existingFilters.filter((_, i) => i !== index)
    updateURL(newFilters)
  }

  const hasYearMonthFilters = useMemo(() => {
    const filtersParam = searchParams.get('filters')
    if (!filtersParam) return false
    try {
      const parsed = JSON.parse(filtersParam)
      return parsed.year !== undefined || parsed.month !== undefined
    } catch {
      return false
    }
  }, [searchParams])

  const clearAll = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    const filtersParam = current.get('filters')
    
    let filtersObj: Record<string, unknown> = {}
    if (filtersParam) {
      try {
        const parsed = JSON.parse(filtersParam)
        filtersObj = { year: parsed.year, month: parsed.month }
      } catch {
        filtersObj = {}
      }
    }
    
    current.delete('sort')
    current.delete('query')
    current.set('page', '1')
    current.set('filters', JSON.stringify(filtersObj))
    router.push('?' + current.toString())
  }

  useEffect(() => {
    if (embedded) return

    const handleSearch = () => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      if (delayedQuery) {
        current.set('query', delayedQuery)
      } else {
        current.delete('query')
      }

      if (!searchParams.has('page')) {
        current.set('page', '1')
      }

      router.push('?' + current.toString())
    }
    handleSearch()
  }, [delayedQuery, router, searchParams, embedded])

  const selectedField = fields.find(f => f.key === currentFilter.field)
  const availableOperators = getFieldOperators(selectedField?.type || 'text')

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentFilter.field && currentFilter.value) {
      addFilter()
    }
  }

  const srStatus = (
    <div className='sr-only' role='status' aria-live='polite'>
      {existingFilters.find(f => f.sort)?.sort
        ? `Ordenado por ${fields.find(f => f.key === existingFilters.find(f2 => f2.sort)?.field)?.label} em ordem ${existingFilters.find(f => f.sort)?.sort === 'asc' ? 'crescente' : 'decrescente'}`
        : 'Sem ordenação ativa'}
    </div>
  )

  const fieldSelect = (
    <Select
      value={currentFilter.field}
      onValueChange={value => setCurrentFilter({ ...currentFilter, field: value })}
    >
      <SelectTrigger>
        <SelectValue placeholder='Selecione um campo' />
      </SelectTrigger>
      <SelectContent>
        {fields.map(field => (
          <SelectItem key={field.key} value={field.key}>
            {field.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const operatorSelect = (
    <Select
      value={currentFilter.operator}
      onValueChange={value => setCurrentFilter({ ...currentFilter, operator: value })}
    >
      <SelectTrigger>
        <SelectValue placeholder='Operador' />
      </SelectTrigger>
      <SelectContent>
        {availableOperators.map(op => (
          <SelectItem key={op.value} value={op.value}>
            {op.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const valueField =
    selectedField?.type === 'select' ? (
      <Select value={currentFilter.value} onValueChange={value => setCurrentFilter({ ...currentFilter, value })}>
        <SelectTrigger>
          <SelectValue placeholder='Valor' />
        </SelectTrigger>
        <SelectContent>
          {selectedField.options?.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Input
        placeholder='Digite o valor'
        value={currentFilter.value}
        onChange={e => setCurrentFilter({ ...currentFilter, value: e.target.value })}
        onKeyDown={handleKeyPress}
        type={selectedField?.type === 'date' ? 'date' : 'text'}
        className='w-full'
      />
    )

  const builderBody = (
    <>
      {embedded ? (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            {fieldSelect}
            {operatorSelect}
          </div>

          <div className='flex items-end gap-2'>
            <div className='flex-1 min-w-0'>{valueField}</div>

            <Button
              size='icon'
              onClick={addFilter}
              disabled={!currentFilter.field || !currentFilter.value}
              title='Adicionar filtro'
              aria-label='Adicionar filtro'
              className='shrink-0'
            >
              <Search className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ) : (
        <div className='grid gap-4 items-end sm:grid-cols-2 lg:grid-cols-[1fr_1.5fr_2fr_auto]'>
          {fieldSelect}
          {operatorSelect}
          {valueField}

          <Button
            onClick={addFilter}
            disabled={!currentFilter.field || !currentFilter.value}
            className='w-full sm:w-auto'
          >
            <Plus className='h-4 w-4 mr-2' />
            Adicionar
          </Button>
        </div>
      )}

            {existingFilters.length > 0 && (
              <>
                <Separator />
                <div className='grid gap-3' role='list' aria-label='Filtros ativos'>
                  {existingFilters.map((filter, index) => {
                    const field = fields.find(f => f.key === filter.field)
                    const operator = operators.find(op => op.value === filter.operator)
                    const valueLabel =
                      field?.type === 'select'
                        ? field.options?.find(opt => opt.value === filter.value)?.label
                        : filter.operator === 'like' || filter.operator === 'iLike'
                          ? filter.value.replace(/%/g, '')
                          : filter.value

                    return (
                      <div
                        key={index}
                        className={cn(
                          'flex flex-col gap-2 p-2 rounded-lg w-full bg-surface',
                          !embedded && 'sm:flex-row sm:items-center sm:justify-between'
                        )}
                      >
                        <Badge
                          variant={'secondary'}
                          className={cn('px-3 py-1 text-sm group shadow', filter.sort && 'text-foreground')}
                          role='listitem'
                        >
                          <span className='font-medium'>{field?.label}</span>
                          <span className='mx-1 text-muted-foreground'>{operator?.label}</span>
                          <span>{valueLabel}</span>
                          <button
                            onClick={() => removeFilter(index)}
                            className='ml-2 hover:text-destructive transition-colors'
                            aria-label={`Remover filtro ${field?.label}`}
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </Badge>

                        <Select
                          value={filter.sort || 'none'}
                          onValueChange={value => {
                            const newFilters = [...existingFilters]
                            newFilters.forEach((f, i) => {
                              if (i !== index) f.sort = null
                            })
                            newFilters[index].sort = value === 'none' ? null : (value as 'asc' | 'desc')
                            updateURL(newFilters)
                          }}
                        >
                          <SelectTrigger className={cn('h-8', embedded ? 'w-full' : 'w-[200px]')}>
                            <SelectValue placeholder='Escolha a ordenação' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='none'>
                              <span className='flex items-center'>
                                <ArrowUpDown className='mr-2 h-3.5 w-3.5 text-muted-foreground' />
                                Sem ordenação
                              </span>
                            </SelectItem>
                            <SelectItem value='asc'>
                              <span className='flex items-center'>
                                <ArrowUpAZ className='mr-2 h-3.5 w-3.5 text-blue-600' />
                                Ordem crescente
                              </span>
                            </SelectItem>
                            <SelectItem value='desc'>
                              <span className='flex items-center'>
                                <ArrowDownAZ className='mr-2 h-3.5 w-3.5 text-blue-600' />
                                Ordem decrescente
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
    </>
  )

  if (embedded) {
    return (
      <div className='space-y-4'>
        {srStatus}
        {(existingFilters.length > 0 || hasYearMonthFilters) && (
          <div className='flex justify-end'>
            <Button
              variant='outline'
              size='sm'
              onClick={clearAll}
              className='h-8 px-2 text-text-muted hover:text-danger-foreground'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Limpar tudo
            </Button>
          </div>
        )}
        {builderBody}
      </div>
    )
  }

  return (
    <Card className='w-full shadow-none bg-inherit'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <CardTitle className='text-base font-medium'>Filtros</CardTitle>
            {existingFilters.length > 0 || searchParams.get('query') ? (
              <Badge variant='outline' className='h-6 bg-surface'>
                {[
                  existingFilters.length > 0
                    ? `${existingFilters.length} ${existingFilters.length === 1 ? 'filtro' : 'filtros'}`
                    : null,
                  searchParams.get('query') ? '1 busca' : null
                ]
                  .filter(Boolean)
                  .join(', ')}
              </Badge>
            ) : null}
          </div>
          <div className='flex items-center gap-2'>
            {(existingFilters.length > 0 || hasYearMonthFilters) && (
              <Button
                variant='outline'
                size='sm'
                onClick={clearAll}
                className='h-8 px-2 text-muted-foreground hover:text-destructive'
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Limpar tudo
              </Button>
            )}
            <Button variant='outline' size='sm' onClick={() => setIsCollapsed(!isCollapsed)} className='h-8 px-2'>
              {isCollapsed ? <ChevronDown className='h-4 w-4 mr-2' /> : <ChevronUp className='h-4 w-4 mr-2' />}
              {isCollapsed ? 'Expandir' : 'Recolher'}
            </Button>
          </div>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <>
          {srStatus}
          <CardContent className='space-y-4'>
            <div className='mb-4'>
              <Input
                placeholder='Pesquisar...'
                value={query}
                onChange={event => setQuery(event.target.value)}
                className='max-w-sm'
              />
            </div>
            {builderBody}
          </CardContent>
        </>
      )}
    </Card>
  )
}
