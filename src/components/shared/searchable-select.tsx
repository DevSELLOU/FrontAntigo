'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface SearchableSelectOption {
  value: string
  label: string
  meta?: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Selecionar',
  label,
  required,
  disabled
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(opt => opt.value === value)
  const filteredOptions = options.filter(
    opt =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.meta?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className='space-y-2'>
      {label && (
        <label className='block text-label text-text-body'>
          {label}
          {required && <span className='text-danger-foreground'>*</span>}
        </label>
      )}

      <div className='relative'>
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2.5 text-left text-body',
            'hover:border-border-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            isOpen && 'border-brand-600 ring-2 ring-brand-050'
          )}
        >
          <div className='flex-1 min-w-0'>
            {selectedOption ? (
              <div className='space-y-0.5'>
                <div className='font-medium text-text'>{selectedOption.label}</div>
                {selectedOption.meta && (
                  <div className='text-xs text-text-muted'>{selectedOption.meta}</div>
                )}
              </div>
            ) : (
              <span className='text-text-muted'>{placeholder}</span>
            )}
          </div>
          <ChevronDown className={cn('h-4 w-4 text-text-muted shrink-0 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className='absolute top-full left-0 right-0 mt-2 rounded-md border border-border bg-surface shadow-pop z-50'>
            {/* Search input */}
            <div className='border-b border-border p-3'>
              <input
                ref={inputRef}
                type='search'
                placeholder='Buscar...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600'
              />
            </div>

            {/* Options list */}
            <div className='max-h-48 overflow-y-auto'>
              {filteredOptions.length === 0 ? (
                <div className='p-3 text-center text-sm text-text-muted'>
                  Nenhuma opção encontrada
                </div>
              ) : (
                filteredOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onValueChange(option.value)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className={cn(
                      'w-full flex flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-surface-muted transition-colors',
                      value === option.value && 'bg-brand-050'
                    )}
                  >
                    <div className='font-medium text-text'>{option.label}</div>
                    {option.meta && (
                      <div className='text-xs text-text-muted'>{option.meta}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
