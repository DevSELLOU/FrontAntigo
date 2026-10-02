'use client'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { useState, KeyboardEvent } from 'react'

interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagsInput({ value = [], onChange, placeholder = 'Adicione uma tag' }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue('')
  }

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 min-h-[42px]'>
      {value.map(tag => (
        <Badge key={tag} variant='secondary' className='flex items-center gap-1 px-2 py-0.5'>
          {tag}
          <button
            type='button'
            onClick={() => removeTag(tag)}
            className='ml-1 rounded-full hover:bg-muted p-0.5'
          >
            <X className='h-3 w-3' />
          </button>
        </Badge>
      ))}
      <Input
        type='text'
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (inputValue.trim()) addTag(inputValue)
        }}
        placeholder={value.length === 0 ? placeholder : ''}
        className='flex-1 border-0 bg-transparent px-0 py-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[120px] h-auto'
      />
    </div>
  )
}
