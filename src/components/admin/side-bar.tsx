'use client'

import { UserRole } from '@/enums/user-role.enum'
import type { Company } from '@/interfaces/company.interface'
import { cn } from '@/lib/utils'
import type { SideBarLink } from '@/types/sidebar-link'
import { Building, ChevronRight, ExternalLink, Menu, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { AdminBanner } from './admin-banner'
import { CompanySwitcher } from './company-switcher'
import { SideBarCompany } from './side-bar-company'

interface UserCompany {
  userCompanyId: number
  companyId: number
  companyName: string
  fantasyName: string
  role: string
  logoUrl?: string
}

interface SideBarProps {
  links: SideBarLink[]
  company?: Company
  isSidebarOpen: boolean
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>
  companies?: UserCompany[]
  activeCompanyId?: number
}

export default function SideBar({ links, company, isSidebarOpen, setIsSidebarOpen, companies, activeCompanyId }: SideBarProps) {
  const { data: session } = useSession()
  // State holds the text of the currently open submenu (for independent control)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const pathname = usePathname()
  const route = useRouter()

  const isCompanySidebar = Boolean(company)
  const isSellouAdmin = useMemo(() => session?.user.role === UserRole.Administrator, [session])

  useEffect(() => {
    function verifyCollapsibleChild() {
      // Find the parent link whose child item matches the current pathname
      const activeParentLink = links.find(link => {
        if (link.items?.length) {
          // Use startsWith for dynamic routing check
          return link.items.some(item => pathname.startsWith(item.href)) 
        }
        return false
      })

      // If an active parent is found, set its text as the open submenu.
      if (activeParentLink) {
        setOpenSubmenu(activeParentLink.text)
      } 
    }

    // Only run on initial load or path/link change
    verifyCollapsibleChild()
  }, [pathname, links]) 

  const handleBackToCompanies = () => {
    route.push('/companies')
  }

  const renderLink = (link: SideBarLink) => {
    const isActive = pathname === link.href

    const baseLinkClassNames =
      'w-full px-3 rounded-md text-label text-text-body hover:bg-white/65 transition-colors flex gap-3 items-center h-11'

    if (link.items?.length) {
      const isCurrentlyOpen = openSubmenu === link.text

      const handleToggle = () => {
        setOpenSubmenu(isCurrentlyOpen ? null : link.text)
      }

      return (
        <Collapsible
          key={link.text}
          className='w-full'
          open={isCurrentlyOpen}
          onOpenChange={handleToggle}
        >
          <CollapsibleTrigger
            className={cn(
              baseLinkClassNames,
              'justify-between w-full',
              (isCurrentlyOpen || link.items.some(item => pathname.startsWith(item.href))) && 'bg-brand-700 text-text-inverse font-medium'
            )}
          >
            <div className='flex gap-3 items-center'>
              {link.icon}
              {link.text}
            </div>
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-300 ease-in-out',
                isCurrentlyOpen ? 'rotate-90' : 'rotate-0'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className='pl-9 mt-1 grid overflow-hidden transition-[grid-template-rows] duration-300'>
            <div className='overflow-hidden'>
              <div className='flex flex-col gap-1 py-1'>
                {link.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      'px-3 rounded-md text-label text-text-body hover:bg-white/65 transition-colors h-10 flex items-center',
                      pathname.startsWith(item.href) && 'bg-brand-700 text-text-inverse font-medium'
                    )}
                  >
                    {item.text}
                  </Link>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    if (link.isExternal) {
      return (
        <a
          key={link.href}
          href={link.href}
          target='_blank'
          rel='noreferrer'
          className={cn(baseLinkClassNames, 'justify-between')}
        >
          <div className='flex gap-3 items-center'>
            {link.icon}
            {link.text}
          </div>
          <ExternalLink size={17} className='text-text-muted' />
        </a>
      )
    }

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => setIsSidebarOpen(false)}
        className={cn(baseLinkClassNames, isActive && 'bg-brand-700 text-text-inverse font-medium')}
      >
        {link.icon}
        {link.text}
      </Link>
    )
  }

  return (
    <>
      <div
        className={cn(
          'fixed top-0 left-0 h-full bg-bg-sidebar border-r border-border z-40 transition-transform duration-300 xl:relative xl:translate-x-0 xl:sticky xl:top-0 min-w-[264px] overflow-y-auto overflow-x-hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='relative flex flex-col flex-shrink-0 w-[264px] pt-16 xl:pt-0 h-screen xl:h-screen overflow-y-auto'>
          <SideBarCompany isCompanySidebar={isCompanySidebar} company={company} />

          {isSellouAdmin ? <AdminBanner /> : null}

          <div className='flex flex-col px-4 pb-6 h-full mt-3'>
            {isCompanySidebar && companies && companies.length > 1 && (
              <>
                <CompanySwitcher
                  companies={companies}
                  activeCompanyId={activeCompanyId}
                />
                <Separator className='my-4' />
              </>
            )}

            <div className='flex flex-col gap-1'>{links.map(renderLink)}</div>

            <div className='mt-auto flex flex-col justify-end items-center text-text-body pt-6 border-t border-border'>
              {isCompanySidebar && isSellouAdmin ? (
                <Button variant='default' className='flex gap-2 w-full mb-3' onClick={handleBackToCompanies}>
                  <Building size={18} />
                  Voltar para Empresas
                </Button>
              ) : null}

              <a
                href='https://www.sellou.com.br'
                target='_blank'
                rel='noreferrer'
                className='text-xs text-text-muted hover:text-text-body transition-colors mt-2'
              >
                Sellou · Gestão comercial
              </a>
            </div>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-30 xl:hidden' onClick={() => setIsSidebarOpen(false)} />
      )}
    </>
  )
}

SideBar.Toggle = function Toggle({
  isSidebarOpen,
  setIsSidebarOpen
}: Pick<SideBarProps, 'isSidebarOpen' | 'setIsSidebarOpen'>) {
  return (
    <button className='flex items-center justify-center xl:hidden' onClick={() => setIsSidebarOpen(prev => !prev)}>
      <div className='relative w-6 h-6'>
        <X
          className={cn(
            'absolute inset-0 transition-transform duration-300 ease-in-out',
            isSidebarOpen ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
          )}
          size={24}
        />
        <Menu
          className={cn(
            'absolute inset-0 transition-transform duration-300 ease-in-out',
            isSidebarOpen ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'
          )}
          size={24}
        />
      </div>
    </button>
  )
}
