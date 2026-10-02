'use client'

import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'
import { Product } from '@/interfaces/product.interface'
import { formatCurrency } from '@/utils/format/format-currency'

interface DynamicPriceColumnProps {
  product: Product
  priceTableId: number
  priceTableName: string
}

export function DynamicPriceColumn({ product, priceTableId }: DynamicPriceColumnProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const basePrice = product.price
  const minPrice = product.minPrice || 0
  
  const finalPrice = basePrice
  const isCapped = minPrice > 0 && finalPrice < minPrice
  const displayPrice = isCapped ? minPrice : finalPrice

  const handleEdit = () => {
    setEditValue(displayPrice.toString())
    setIsEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const companyId = window.location.pathname.split('/')[2]
      const response = await fetch(`/company/${companyId}/products/${product.id}/price-override`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          manualPrice: parseFloat(editValue),
          priceTableId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update price')
      }

      setIsEditing(false)
    } catch (error) {
      console.error('Error saving price:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  const handleBlur = () => {
    if (editValue !== displayPrice.toString()) {
      handleSave()
    } else {
      setIsEditing(false)
    }
  }

  const cellClass = isCapped
    ? 'text-danger-foreground font-medium'
    : 'text-info-foreground font-medium'

  if (isEditing) {
    return (
      <Input
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={saving}
        className="h-8 w-24"
        autoFocus
      />
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`cursor-pointer hover:underline ${cellClass}`}
            onClick={handleEdit}
          >
            <span className="flex items-center gap-1">
              {formatCurrency(displayPrice)}
              <span className="text-xs opacity-50">✎</span>
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            {isCapped && <p className="text-danger-foreground">Limitado pelo preço mínimo</p>}
            <p>Base: {formatCurrency(basePrice)}</p>
            {minPrice > 0 && <p>Mín: {formatCurrency(minPrice)}</p>}
            <p className="text-muted-foreground">Clique para editar</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}