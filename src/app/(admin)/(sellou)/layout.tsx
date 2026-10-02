'use client'

import { Header } from '@/components/admin/header'
import { NonAuthorizedPage } from '@/components/admin/non-authorized-page'
import SideBar from '@/components/admin/side-bar'
import { Topbar } from '@/components/admin/topbar'
import { ScreenLoading } from '@/components/ui/screen-loading'
import { UserRole } from '@/enums/user-role.enum'
import { SideBarLink } from '@/types/sidebar-link'
import { removeCustomColor } from '@/utils/remove-custom-color.util'
import { Building, ChartBar, UserRound, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

const links: SideBarLink[] = [
  { href: `/dashboard`, text: 'Dashboard', icon: <ChartBar size={18} /> },
  {
    href: '/companies',
    text: 'Empresas',
    icon: <Building size={18} />
  },
  { href: '/users', text: 'Usuários', icon: <Users size={18} /> },
  // Named for what it is: the only thing this screen ever held was the user's own password.
  { href: '/profile', text: 'Meu perfil', icon: <UserRound size={18} /> }
]

export default function SellouLayout({ children }: LayoutProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isAdministrator = useMemo(() => session?.user.role === UserRole.Administrator, [session])

  const currentPageLabel = useMemo(() => {
    const match = links.find(link => link.href !== '#' && pathname.startsWith(link.href))
    return match?.text ?? ''
  }, [pathname])

  useEffect(() => {
    if (session && status === 'authenticated') {
      removeCustomColor()

      if (session.user.companyId) {
        window.location.href = `/company/${session.user.companyId}/dashboard`
      } else {
        setIsLoading(false)
      }
    }
  }, [session])

  if (isLoading) {
    return <ScreenLoading />
  }

  if (!isAdministrator) {
    return <NonAuthorizedPage />
  }

  return (
    <main className='flex flex-col xl:flex-row h-screen min-h-screen'>
      <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className='flex flex-col xl:flex-row w-full flex-1 h-full pt-16 xl:pt-0'>
        <SideBar links={links} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className='flex flex-col w-full min-w-0 h-full overflow-auto'>
          <Topbar company='Sellou' page={currentPageLabel} />
          {children}
        </div>
      </div>
    </main>
  )
}
