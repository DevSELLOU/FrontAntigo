'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Category } from '@/interfaces/category.interface'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface CategoryDrawerProps {
  categories?: Category[]
  selectedCategoryId: string | null
  selectedSubcategoryId: string | null
  expandedCategoryId: string | null
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  onCategoryChange: (categoryId: string | null) => void
  onSubcategoryChange: (subcategoryId: string | null) => void
  onToggleExpanded: (categoryId: string) => void
  onResetFilters: () => void
  isFetchingCategories: boolean
}

/**
 * O mesmo filtro da barra lateral, para o celular — onde ele é o ÚNICO caminho até as categorias.
 *
 * Todas as cores aqui eram fixas (`bg-blue-100`, `text-blue-700`, `bg-gray-100`), ignorando o
 * white-label: numa loja verde ou laranja, o item selecionado aparecia azul.
 */
export function CategoryDrawer({
  categories,
  selectedCategoryId,
  selectedSubcategoryId,
  expandedCategoryId,
  isDrawerOpen,
  setIsDrawerOpen,
  onCategoryChange,
  onSubcategoryChange,
  onToggleExpanded,
  onResetFilters,
  isFetchingCategories
}: CategoryDrawerProps) {
  const noCategorySelected = !selectedCategoryId && !selectedSubcategoryId

  const selectRow = (selected: boolean) =>
    cn(
      'flex min-h-11 w-full items-center rounded px-2 text-left text-base font-medium',
      selected ? 'bg-primary/10 text-primary' : 'hover:bg-surface-muted'
    )

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent side='left' className='flex w-4/5 flex-col'>
        <SheetHeader className='mb-7'>
          <SheetTitle>Categorias</SheetTitle>
        </SheetHeader>

        <button
          className={selectRow(noCategorySelected)}
          onClick={() => {
            onResetFilters()
            setIsDrawerOpen(false)
          }}
        >
          Todos os produtos
        </button>

        <div className='min-h-0 flex-1 -mx-6 space-y-2 overflow-y-auto px-6'>
          {isFetchingCategories ? (
            <div className='mt-2 space-y-2'>
              {[...Array(3)].map((_, index) => (
                <div key={index} className='h-11 w-full animate-pulse rounded bg-border'></div>
              ))}
            </div>
          ) : (
            categories?.map(category => {
              const categoryId = String(category.id)
              const isSelected = selectedCategoryId === categoryId
              const isExpanded = expandedCategoryId === categoryId

              return (
                <div key={category.id}>
                  <div className='flex items-center gap-1'>
                    <button
                      className={selectRow(isSelected && !selectedSubcategoryId)}
                      aria-pressed={isSelected && !selectedSubcategoryId}
                      onClick={() => {
                        onCategoryChange(categoryId)
                        setIsDrawerOpen(false)
                      }}
                    >
                      {category.name}
                    </button>

                    {category.subCategories?.length ? (
                      <button
                        className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded hover:bg-surface-muted'
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? 'Recolher' : 'Expandir'} subcategorias de ${category.name}`}
                        onClick={() => onToggleExpanded(categoryId)}
                      >
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 text-text-muted transition-transform motion-reduce:transition-none',
                            isExpanded ? 'rotate-90' : 'rotate-0'
                          )}
                        />
                      </button>
                    ) : null}
                  </div>

                  {isExpanded && (
                    <div className='mt-1 space-y-1 pl-4'>
                      {category.subCategories?.map(subcategory => (
                        <button
                          key={subcategory.id}
                          className={selectRow(isSelected && selectedSubcategoryId === String(subcategory.id))}
                          aria-pressed={isSelected && selectedSubcategoryId === String(subcategory.id)}
                          onClick={() => {
                            onCategoryChange(categoryId)
                            onSubcategoryChange(String(subcategory.id))
                            setIsDrawerOpen(false)
                          }}
                        >
                          {subcategory.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
