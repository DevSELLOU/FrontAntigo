'use client'

import { useShop } from '@/hooks/use-shop'
import { cn } from '@/lib/utils'
import { removeNonNumericChars } from '@/utils/remove-non-numeric-chars.util'
import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

/**
 * The band at the top of the storefront that tells a visitor whose shop this is.
 *
 * The shop used to open straight onto a grid titled "Produtos", with the company name appearing
 * only inside the coloured header bar — a buyer arriving from a shared link had nothing
 * identifying the seller, and no way to reach them.
 *
 * It has to look deliberate with no cover uploaded, because that is every company's starting
 * state: without an image it composes a band from the shop's own colour instead of collapsing.
 */
export function ShopCover() {
  const { company } = useShop()
  const [coverFailed, setCoverFailed] = useState(false)

  if (!company) return null

  const hasCover = Boolean(company.coverUrl) && !coverFailed
  const whatsappDigits = company.whatsapp ? removeNonNumericChars(company.whatsapp) : ''
  const phoneDigits = company.phone ? removeNonNumericChars(company.phone) : ''
  const hasFooterLine = Boolean(company.address || company.businessHours)

  return (
    <section
      aria-label={`Sobre ${company.fantasyName}`}
      className={cn(
        'relative isolate w-full overflow-hidden',
        // No cover: the band paints itself with the shop's own colour, which `bg-primary` resolves
        // from `--custom-color`. The two overlays below stop it reading as a flat rectangle.
        !hasCover && 'bg-primary'
      )}
    >
      {hasCover ? (
        <>
          <Image
            src={company.coverUrl!}
            alt=''
            aria-hidden='true'
            fill
            priority
            sizes='100vw'
            className='object-cover'
            onError={() => setCoverFailed(true)}
          />
          {/* Legibility scrim. Text over an unknown photo needs its own contrast floor — the
              company's colour tokens cannot be trusted to read against arbitrary imagery. */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20' aria-hidden='true' />
        </>
      ) : (
        <>
          <div
            aria-hidden='true'
            className='absolute inset-0 bg-[radial-gradient(120%_140%_at_15%_0%,rgba(255,255,255,0.22),transparent_60%)]'
          />
          <div aria-hidden='true' className='absolute inset-0 bg-gradient-to-br from-transparent to-black/25' />
        </>
      )}

      <div className='relative mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 sm:py-10 md:px-10 lg:py-14'>
        <div className='flex items-center gap-4'>
          {company.logoUrl && (
            <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-white/95 p-2 shadow-lg sm:h-20 sm:w-20'>
              <Image
                src={company.logoUrl}
                alt={`Logo ${company.fantasyName}`}
                fill
                priority
                sizes='80px'
                className='object-contain p-2'
              />
            </div>
          )}

          <div className='min-w-0'>
            <h1
              className={cn(
                'truncate text-2xl font-bold sm:text-3xl lg:text-4xl',
                hasCover ? 'text-white' : 'text-primary-foreground'
              )}
            >
              {company.fantasyName}
            </h1>
            {company.corporateName && company.corporateName !== company.fantasyName && (
              <p className={cn('truncate text-sm', hasCover ? 'text-white/80' : 'text-primary-foreground opacity-80')}>
                {company.corporateName}
              </p>
            )}
          </div>
        </div>

        {company.about && (
          <p
            className={cn(
              'max-w-3xl text-sm leading-relaxed sm:text-base',
              hasCover ? 'text-white/90' : 'text-primary-foreground opacity-90'
            )}
          >
            {company.about}
          </p>
        )}

        {(whatsappDigits || phoneDigits) && (
          <div className='flex flex-wrap gap-3'>
            {whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-gray-900 shadow-sm transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none'
              >
                <MessageCircle className='h-4 w-4' aria-hidden='true' />
                Falar no WhatsApp
              </a>
            )}
            {phoneDigits && (
              <a
                href={`tel:${phoneDigits}`}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none',
                  // Over a photo the scrim guarantees white reads; over the brand colour it does
                  // not, so the outline button follows the contrast-computed foreground instead.
                  hasCover
                    ? 'border-white/70 text-white focus-visible:outline-white'
                    : 'border-primary-foreground text-primary-foreground focus-visible:outline-current'
                )}
              >
                <Phone className='h-4 w-4' aria-hidden='true' />
                {company.phone}
              </a>
            )}
          </div>
        )}

        {hasFooterLine && (
          <div
            className={cn(
              'flex flex-wrap items-center gap-x-6 gap-y-2 text-sm',
              hasCover ? 'text-white/85' : 'text-primary-foreground opacity-80'
            )}
          >
            {company.address && (
              <span className='inline-flex items-center gap-2'>
                <MapPin className='h-4 w-4 flex-shrink-0' aria-hidden='true' />
                {company.address}
              </span>
            )}
            {company.businessHours && (
              <span className='inline-flex items-center gap-2'>
                <Clock className='h-4 w-4 flex-shrink-0' aria-hidden='true' />
                {company.businessHours}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
