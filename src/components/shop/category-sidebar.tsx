'use client'

import { Category } from '@/interfaces/category.interface'
import { cn } from '@/lib/utils'
import { ChevronRight, Filter } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Button } from '../ui/button'

const CategoryDrawer = dynamic(() => import('./category-drawer').then(mod => mod.CategoryDrawer))

interface CategorySidebarProps {
  categories?: Category[]
  isFetchingCategories: boolean
  categoriesError: boolean
  onRetryCategories: () => void
  selectedCategoryId: string | null
  selectedSubcategoryId: string | null
  onCategoryChange: (categoryId: string | null) => void
  onSubcategoryChange: (subcategoryId: string | null) => void
}

export function CategorySidebar({
  categories,
  isFetchingCategories,
  categoriesError,
  onRetryCategories,
  selectedCategoryId,
  selectedSubcategoryId,
  onCategoryChange,
  onSubcategoryChange
}: CategorySidebarProps) {
  // Só a expansão é local: ela é estado de interface, não filtro, e não pertence à URL.
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(selectedCategoryId)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const noCategorySelected = !selectedCategoryId && !selectedSubcategoryId

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategoryId(categoryId)
    onCategoryChange(categoryId)
  }

  // Expandir deixou de aplicar filtro. Antes o mesmo clique fazia as duas coisas, então não dava
  // para espiar as subcategorias sem filtrar — e recolher significava reaplicar.
  const toggleExpanded = (categoryId: string) =>
    setExpandedCategoryId(current => (current === categoryId ? null : categoryId))

  const handleResetFilters = () => {
    onCategoryChange(null)
    setExpandedCategoryId(null)
  }

  const renderSelectedCategory = () => {
    const category = categories?.find(cat => String(cat.id) === selectedCategoryId)

    if (!category) return 'Categorias'

    const subcategoryName = category.subCategories?.find(sub => String(sub.id) === selectedSubcategoryId)?.name

    return subcategoryName ? `${category.name} - ${subcategoryName}` : `${category.name} - Tudo`
  }

  return (
    <>
      <aside className='w-64 p-5 border-r min-h-screen hidden md:block'>
        <div className='sticky top-24'>
          <h2 className='font-semibold'>Categorias</h2>

          <Button
            variant={noCategorySelected ? 'default' : 'outline'}
            onClick={handleResetFilters}
            className={cn('mt-4', {
              'bg-primary/10 text-primary border border-primary hover:bg-primary/20': noCategorySelected
            })}
          >
            Todos os produtos
          </Button>

          {isFetchingCategories ? (
            <div className='mt-4 space-y-3'>
              {[...Array(5)].map((_, index) => (
                <div key={index} className='w-full h-6 rounded bg-border animate-pulse'></div>
              ))}
            </div>
          ) : categoriesError ? (
            <div className='mt-4 space-y-3 text-sm'>
              <p className='text-text-muted'>Não foi possível carregar as categorias.</p>
              <Button variant='outline' size='sm' onClick={onRetryCategories}>
                Tentar de novo
              </Button>
            </div>
          ) : (
            categories?.map(category => {
              const categoryId = String(category.id)
              const isSelected = selectedCategoryId === categoryId
              const isExpanded = expandedCategoryId === categoryId

              return (
                <div key={category.id} className='mt-4'>
                  <div className='flex items-center justify-between gap-2'>
                    <button
                      className={cn('flex-1 text-left text-sm font-medium', isSelected && 'text-primary underline')}
                      aria-pressed={isSelected}
                      onClick={() => handleCategoryClick(categoryId)}
                    >
                      {category.name}
                    </button>

                    {category.subCategories?.length ? (
                      <button
                        className='flex h-11 w-11 flex-shrink-0 items-center justify-center'
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? 'Recolher' : 'Expandir'} subcategorias de ${category.name}`}
                        onClick={() => toggleExpanded(categoryId)}
                      >
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform motion-reduce:transition-none',
                            isExpanded ? 'rotate-90' : 'rotate-0'
                          )}
                        />
                      </button>
                    ) : null}
                  </div>

                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300 ease-in-out motion-reduce:transition-none',
                      isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className='pl-4 mt-2 space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <input
                          type='radio'
                          id={`category-${category.id}-all`}
                          name={`subcategory-${category.id}`}
                          onChange={() => handleCategoryClick(categoryId)}
                          // Comparado com a categoria REALMENTE selecionada. Antes era só
                          // `!selectedSubcategory`, então todas as categorias apareciam com
                          // "Tudo em X" marcado ao mesmo tempo.
                          checked={isSelected && !selectedSubcategoryId}
                        />
                        <label htmlFor={`category-${category.id}-all`} className='text-sm'>
                          Tudo em {category.name}
                        </label>
                      </div>

                      {category.subCategories?.map(subcategory => (
                        <div key={subcategory.id} className='flex items-center space-x-2'>
                          <input
                            type='radio'
                            // Por id: o `id` anterior usava o NOME da subcategoria, que tem espaço
                            // e pode repetir entre categorias, quebrando o par label/input.
                            id={`subcategory-${subcategory.id}`}
                            name={`subcategory-${category.id}`}
                            onChange={() => {
                              onCategoryChange(categoryId)
                              onSubcategoryChange(String(subcategory.id))
                            }}
                            checked={isSelected && selectedSubcategoryId === String(subcategory.id)}
                          />
                          <label htmlFor={`subcategory-${subcategory.id}`} className='text-sm'>
                            {subcategory.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* O rótulo é dinâmico e pode ser tão longo quanto "Ferramentas Elétricas - Furadeiras de
          Impacto". O Button é `whitespace-nowrap` por padrão e este é filho direto da coluna flex
          da página, sem teto de largura — um nome longo empurrava para fora da viewport e dava
          rolagem horizontal à loja inteira. */}
      <Button
        variant='secondary'
        className='mx-4 mt-4 flex min-h-11 max-w-[calc(100%-2rem)] items-center gap-2 md:hidden'
        aria-expanded={isDrawerOpen}
        aria-haspopup='dialog'
        onClick={() => setIsDrawerOpen(true)}
      >
        <Filter className='size-5 flex-shrink-0' />
        <span className='truncate'>{renderSelectedCategory()}</span>
      </Button>

      <CategoryDrawer
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        selectedSubcategoryId={selectedSubcategoryId}
        expandedCategoryId={expandedCategoryId}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        onCategoryChange={onCategoryChange}
        onSubcategoryChange={onSubcategoryChange}
        onToggleExpanded={toggleExpanded}
        onResetFilters={handleResetFilters}
        isFetchingCategories={isFetchingCategories}
      />
    </>
  )
}
