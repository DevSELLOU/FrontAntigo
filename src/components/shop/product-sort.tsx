'use client'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowUpDown, Check } from 'lucide-react'

interface ProductSortProps {
  onSort: (value: string) => void
  sortBy: string
  isAuthenticated?: boolean
}

export function ProductSort({ onSort, sortBy, isAuthenticated }: ProductSortProps) {
  function getCurrentSort() {
    if (sortBy === 'name-asc') return 'Nome (A-Z)'
    if (sortBy === 'name-desc') return 'Nome (Z-A)'
    if (sortBy === 'price-asc') return 'Preço (Menor para Maior)'
    if (sortBy === 'price-desc') return 'Preço (Maior para Menor)'
    return 'Padrão'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>
          <ArrowUpDown className='mr-2 h-4 w-4' />
          {getCurrentSort()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuItem onClick={() => onSort('name-asc')} className='flex items-center justify-between'>
          Nome (A-Z)
          {sortBy === 'name-asc' && <Check className='h-4 w-4' />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('name-desc')} className='flex items-center justify-between'>
          Nome (Z-A)
          {sortBy === 'name-desc' && <Check className='h-4 w-4' />}
        </DropdownMenuItem>

        {isAuthenticated ? (
          <>
            <DropdownMenuItem onClick={() => onSort('price-asc')} className='flex items-center justify-between'>
              Preço (Menor para Maior)
              {sortBy === 'price-asc' && <Check className='h-4 w-4' />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort('price-desc')} className='flex items-center justify-between'>
              Preço (Maior para Menor)
              {sortBy === 'price-desc' && <Check className='h-4 w-4' />}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
