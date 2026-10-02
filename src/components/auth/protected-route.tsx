'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { ScreenLoading } from '../ui/screen-loading'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push(`/sign-in`)
    }
  }, [session, status, router, pathname])

  if (status === 'loading' || !session) {
    return <ScreenLoading />
  }

  return children
}
