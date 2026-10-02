import { Columns3, LayoutGrid, List } from 'lucide-react'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'

export type LayoutModeType = 'grid' | 'list' | 'kanban'
interface LayoutModeProps {
  mode: LayoutModeType
  onChange: Dispatch<SetStateAction<LayoutModeType>>
  enableKanban?: boolean
}

const LAYOUT_STORAGE_KEY = 'layout-mode'

export function LayoutModeSelector({ mode, onChange, enableKanban = false }: LayoutModeProps) {
  useEffect(() => {
    const savedMode = localStorage.getItem(LAYOUT_STORAGE_KEY) as LayoutModeType | null
    if (savedMode && (savedMode === 'grid' || savedMode === 'list' || (enableKanban && savedMode === 'kanban'))) {
      onChange(savedMode)
    }
  }, [onChange, enableKanban])

  const handleLayoutChange = (newMode: LayoutModeType) => {
    onChange(newMode)
    localStorage.setItem(LAYOUT_STORAGE_KEY, newMode)
  }

  return (
    <div className='flex gap-2'>
      <Button variant={mode === 'grid' ? 'default' : 'outline'} onClick={() => handleLayoutChange('grid')}>
        <LayoutGrid className='h-4 w-4' />
        <Label className='hidden md:block'>Visualização em grade</Label>
      </Button>
      <Button variant={mode === 'list' ? 'default' : 'outline'} onClick={() => handleLayoutChange('list')}>
        <List className='h-4 w-4' />
        <Label className='hidden md:block'>Visualização em lista</Label>
      </Button>
      {enableKanban && (
        <Button variant={mode === 'kanban' ? 'default' : 'outline'} onClick={() => handleLayoutChange('kanban')}>
          <Columns3 className='h-4 w-4' />
          <Label className='hidden md:block'>Visualização Kanban</Label>
        </Button>
      )}
    </div>
  )
}
