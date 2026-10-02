'use client'

import { Bell, ChevronDown, LogOut, Moon, Sun, User } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import { UserRole } from '@/enums/user-role.enum'
import { getUserInitials } from '@/utils/users/get-user-initials.util'
import { getUserRoleText } from '@/utils/users/get-user-role-text.util'
import { resolveProfileHref } from '@/utils/users/resolve-profile-href.util'

interface TopbarProps {
  company?: string
  page?: string
}

export function Topbar({ company, page }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { user, role } = useAuth()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const breadcrumbItems = [company, page].filter(Boolean) as string[]
  const roleLabel = role && Object.values(UserRole).includes(role as UserRole) ? getUserRoleText(role as UserRole) : ''
  const profileHref = resolveProfileHref(pathname)

  return (
    <header className='hidden xl:flex h-16 items-center justify-between border-b border-border bg-surface px-8 sticky top-0 z-40'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1 text-sm'>
        {breadcrumbItems.map((item, idx) => (
          <div key={idx} className='flex items-center gap-1'>
            {idx > 0 && <span className='text-text-muted'>›</span>}
            <span className={idx === breadcrumbItems.length - 1 ? 'text-text font-semibold' : 'text-text-muted'}>
              {item}
            </span>
          </div>
        ))}
      </nav>

      {/* Right section: Notifications + Profile */}
      <div className='flex items-center gap-4'>
        {/* Notifications */}
        <button className='relative flex h-9 w-9 items-center justify-center rounded-md text-text-body hover:bg-surface-muted transition-colors'>
          <Bell size={20} />
          <span className='absolute top-1 right-1 h-2 w-2 bg-brand-500 rounded-full' />
        </button>

        {/* Profile Menu */}
        <div className='relative' ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className='flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-surface-muted transition-colors'
          >
            <div className='flex flex-col items-end'>
              <span className='font-label text-text'>{user?.name ?? '—'}</span>
              <span className='text-caption text-text-muted'>{roleLabel}</span>
            </div>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold'>
              {getUserInitials(user?.name)}
            </div>
            <ChevronDown size={16} className='text-text-muted' />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className='absolute right-0 mt-1 w-48 rounded-md border border-border bg-surface shadow-pop'>
              <Link
                href={profileHref}
                onClick={() => setIsProfileOpen(false)}
                className='flex w-full items-center gap-3 px-4 py-2 text-sm text-text-body hover:bg-surface-muted first:rounded-t-md'
              >
                <User size={16} />
                Meu perfil
              </Link>
              <button
                onClick={() => {
                  toggleTheme()
                }}
                className='flex w-full items-center gap-3 px-4 py-2 text-sm text-text-body hover:bg-surface-muted'
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              </button>
              <button
                onClick={() => signOut()}
                className='flex w-full items-center gap-3 px-4 py-2 text-sm text-danger-foreground hover:bg-surface-muted rounded-b-md'
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
