'use client'

import LogoDark from '@/assets/logo.webp'
import LogoWhite from '@/assets/logo-white.webp'
import { useShop } from '@/hooks/use-shop'
import { getForegroundColor } from '@/utils/get-foreground-color.util'
import { isValidColor } from '@/utils/is-valid-color.util'
import Image from 'next/image'
import { useMemo } from 'react'

export function Footer() {
  const { company } = useShop()

  /**
   * The bar is painted with the shop's own colour, so the Sellou mark has to pick the variant that
   * survives on it — a dark wordmark disappears on a dark green bar and vice versa. This is the
   * same luminance test `setCustomColor` already uses to choose the text colour, so the logo and
   * the text always agree.
   */
  const usesLightMark = useMemo(() => {
    const brandColor = company?.shopColor || company?.customColor

    if (!brandColor || !isValidColor(brandColor)) return true

    return getForegroundColor(`#${brandColor}`) === '#FFFFFF'
  }, [company?.shopColor, company?.customColor])

  if (!company) return null

  return (
    <footer
      className='fixed bottom-0 left-0 right-0 z-40 bg-primary px-6 py-3 text-primary-foreground shadow-[0_-2px_10px_rgba(0,0,0,0.1)]'
      // Without this the bar sits under the iPhone home indicator, which eats the signature.
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className='mx-auto flex w-full max-w-7xl items-center justify-between gap-4'>
        <span className='truncate text-sm font-semibold'>{company.fantasyName}</span>

        <a
          href='https://sellou.com.br'
          target='_blank'
          rel='noopener noreferrer'
          className='flex flex-shrink-0 items-center gap-2 opacity-90 transition-opacity hover:opacity-100 motion-reduce:transition-none'
        >
          <span className='hidden text-xs sm:inline'>Desenvolvido pela</span>
          <Image
            src={usesLightMark ? LogoWhite : LogoDark}
            alt='Sellou'
            height={18}
            className='h-[18px] w-auto'
          />
        </a>
      </div>
    </footer>
  )
}
