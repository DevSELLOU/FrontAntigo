'use client'

import ProtectedRoute from '@/components/auth/protected-route'
import { CacheRefreshButton } from '@/components/cache-refresh-button'
import { QueryProvider } from '@/components/providers/query-provider'
import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <QueryProvider>
        <ProtectedRoute>
          {children}
          <CacheRefreshButton />
        </ProtectedRoute>
      </QueryProvider>
    </SessionProvider>
  )
}
