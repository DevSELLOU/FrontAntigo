'use client'

import { useDelayedState } from '@/hooks/use-delayed-state'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Input } from '../ui/input'

export function Filter() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { replace } = useRouter()

  const [query, setQuery, delayedQuery] = useDelayedState(searchParams.get('query') || '')

  useEffect(() => {
    const handleSearch = () => {
      const params = new URLSearchParams(searchParams)

      if (delayedQuery) {
        params.set('query', delayedQuery)
        params.set('page', '1')
      } else {
        params.delete('query')
      }

      replace(`${pathname}?${params.toString()}`)
    }

    handleSearch()
  }, [delayedQuery, pathname, replace, searchParams])

  return (
    <div className='flex items-center justify-end gap-4'>
      <Input
        className='xl:w-96'
        placeholder='Pesquisar...'
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
    </div>
  )
}
