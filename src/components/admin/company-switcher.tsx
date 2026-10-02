'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Building, Check, ChevronsUpDown } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserCompany {
  userCompanyId: number
  companyId: number
  companyName: string
  fantasyName: string
  role: string
  logoUrl?: string
}

interface CompanySwitcherProps {
  companies: UserCompany[]
  activeCompanyId?: number
  className?: string
}

export function CompanySwitcher({ companies, activeCompanyId, className }: CompanySwitcherProps) {
  const { update } = useSession()
  const router = useRouter()
  const [isSwitching, setIsSwitching] = useState(false)

  if (!companies || companies.length <= 1) {
    return null
  }

  const activeCompany = companies.find((c) => c.companyId === activeCompanyId)

  const handleSwitchCompany = async (companyId: number) => {
    if (companyId === activeCompanyId || isSwitching) return

    setIsSwitching(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/switch-company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.match(/accessToken=([^;]+)/)?.[1]}`
        },
        body: JSON.stringify({ companyId })
      })

      if (!response.ok) {
        throw new Error('Erro ao trocar de empresa')
      }

      const { data } = await response.json()

      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}`

      await update({
        companyId: companyId,
        activeCompanyId: companyId,
        role: data.role
      })

      router.push(`/company/${companyId}/dashboard`)
      router.refresh()
    } catch (error) {
      console.error('Erro ao trocar de empresa:', error)
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-between gap-2 h-auto py-2 px-3',
            className
          )}
          disabled={isSwitching}
        >
          <div className='flex items-center gap-2 min-w-0'>
            {activeCompany?.logoUrl?.startsWith('https://') ? (
              <img
                src={activeCompany.logoUrl}
                alt={activeCompany.fantasyName}
                className='w-6 h-6 rounded object-contain flex-shrink-0'
              />
            ) : (
              <Building size={16} className='flex-shrink-0' />
            )}
            <span className='truncate text-sm font-medium'>
              {activeCompany?.fantasyName || 'Selecionar empresa'}
            </span>
          </div>
          <ChevronsUpDown size={14} className='flex-shrink-0 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-[--radix-dropdown-menu-trigger-width]'>
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.companyId}
            onClick={() => handleSwitchCompany(company.companyId)}
            className='flex items-center gap-2 cursor-pointer'
          >
            {company.logoUrl?.startsWith('https://') ? (
              <img
                src={company.logoUrl}
                alt={company.fantasyName}
                className='w-5 h-5 rounded object-contain'
              />
            ) : (
              <Building size={14} />
            )}
            <span className='flex-1 truncate'>{company.fantasyName}</span>
            {company.companyId === activeCompanyId && (
              <Check size={14} className='flex-shrink-0' />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
