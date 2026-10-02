'use client'

import { ChartBar, Clipboard, Contact, Package } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MobileFooterMenuProps {
  companyId: number
}

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: ChartBar },
  { href: '/customers', label: 'Clientes', icon: Contact },
  { href: '/orders', label: 'Pedidos', icon: Clipboard },
  { href: '/routes', label: 'Rotas', icon: Package }
]

export function MobileFooterMenu({ companyId }: MobileFooterMenuProps) {
  const pathname = usePathname()

  return (
    <nav className='lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50' style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className='flex justify-around items-center h-16'>
        {menuItems.map(item => {
          const fullHref = `/company/${companyId}${item.href}`
          const isActive = pathname === fullHref || pathname.startsWith(fullHref)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={fullHref}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1',
                'text-text-muted hover:text-text-body transition-colors',
                isActive && 'text-brand-700 font-medium'
              )}
            >
              <Icon size={20} className={cn(isActive && 'text-brand-700')} />
              <span className='text-xs'>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
