'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Eraser } from 'lucide-react'
import { useState } from 'react'

export function CacheRefreshButton() {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries()
    setIsRefreshing(false)
    window.location.reload()
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className='fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
      title='Limpar cache'
    >
      {' '}
      <Eraser className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
    </button>
  )
}
