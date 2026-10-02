import Logo from '@/assets/logo-white.webp'
import { Company } from '@/interfaces/company.interface'
import { cn } from '@/lib/utils'
import getShortName from '@/utils/get-short-name.util'
import Image from 'next/image'

interface SideBarCompanyProps {
  isCompanySidebar: boolean
  company?: Company
}

export function SideBarCompany({ isCompanySidebar, company }: SideBarCompanyProps) {
  const hasCustomLogo = Boolean(company?.logoUrl)

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center w-full break-all',
        hasCustomLogo ? 'border-b border-b-zinc-100' : 'aside-content-pattern'
      )}
    >
      <div className='p-5'>
        {isCompanySidebar ? (
          hasCustomLogo ? (
            <div className='relative w-40 h-20'>
              <Image
                priority
                fill
                sizes='160px'
                src={company?.logoUrl ?? ''}
                alt={`Logo ${company?.fantasyName}`}
                className='rounded-md object-contain'
                unoptimized={true}
              />
            </div>
          ) : (
            <h1 className='font-bold text-2xl text-white uppercase line-clamp-1'>
              {getShortName(company?.fantasyName)}
            </h1>
          )
        ) : (
          <Image src={Logo} height={50} alt='Logo - Sellou' />
        )}
      </div>
    </div>
  )
}
