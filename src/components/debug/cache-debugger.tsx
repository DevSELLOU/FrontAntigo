'use client'

import { useEffect, useState } from 'react'
import { queryClient } from '@/lib/query-client'

interface CacheDebuggerProps {
  companyId: number
}

export function CacheDebugger(_props: CacheDebuggerProps) {
  const [cachedQueries, setCachedQueries] = useState<string[]>([])

  useEffect(() => {
    // Get all cached queries
    const queries = queryClient.getQueryCache().getAll()
    const queryKeys = queries.map(q => JSON.stringify(q.queryKey))
    setCachedQueries(queryKeys)
  }, [])

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-20 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Cache Status</h4>
      <div className="space-y-1">
        {cachedQueries.length === 0 ? (
          <p className="text-gray-400">No cached queries</p>
        ) : (
          cachedQueries.map((key, i) => (
            <p key={i} className="truncate text-green-400">
              {key.substring(0, 50)}...
            </p>
          ))
        )}
      </div>
    </div>
  )
}
