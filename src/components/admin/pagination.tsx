'use client'
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination as ShadcnPagination
} from '@/components/ui/pagination'
import { useSearchParams } from 'next/navigation'
import type { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'

interface PaginationProps {
  metadata?: PaginatedResponseMetadata
}

export function Pagination({ metadata }: PaginationProps) {
  const searchParams = useSearchParams()

  if (!metadata) return null

  const total = parseInt(metadata.total, 10)
  const page = parseInt(metadata.page, 10)
  const limit = parseInt(metadata.limit, 10)

  const firstItemOnPage = total === 0 ? 0 : (page - 1) * limit + 1
  const lastItemOnPage = total < limit ? total : limit * page

  const text = `Exibindo ${firstItemOnPage} a ${lastItemOnPage} de ${total} resultados`

  const totalPages = Math.ceil(total / limit)

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `?${params.toString()}`
  }

  const previousPageHref =
    page > 1 ? createPageURL(page - 1) : createPageURL(1)

  const nextPageHref =
    page < totalPages ? createPageURL(page + 1) : createPageURL(totalPages)

  return (
    <div className='flex flex-col gap-4 md:items-center md:justify-between md:flex-row'>
      <span className='text-text-muted text-sm flex-shrink-0'>{text}</span>
      <ShadcnPagination aria-label='Navegação de páginas' className='justify-center md:justify-end'>
        <PaginationPrevious href={previousPageHref}>Anterior</PaginationPrevious>
        <PaginationContent>
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNumber = i + 1
            const href = createPageURL(pageNumber)

            if (pageNumber === 1 || pageNumber === totalPages) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink href={href} isActive={pageNumber === page}>
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            }

            if (Math.abs(page - pageNumber) <= 2) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink href={href} isActive={pageNumber === page}>
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            }

            if (Math.abs(page - pageNumber) === 3) {
              return <PaginationEllipsis key={pageNumber}>...</PaginationEllipsis>
            }

            return null
          })}
        </PaginationContent>
        <PaginationNext href={nextPageHref}>Próximo</PaginationNext>
      </ShadcnPagination>
    </div>
  )
}
