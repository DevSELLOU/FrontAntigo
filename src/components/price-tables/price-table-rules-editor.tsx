'use client'

import { RuleFormData } from './price-table.types'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { FormLabel } from '../ui/form'
import { MultiSelect } from '../ui/multi-select'
import { CountryState } from '@/enums/country-state.enum'

interface PriceTableRulesEditorProps {
  rules: RuleFormData[]
  onAddRule: () => void
  onRemoveRule: (index: number) => void
  onUpdateRule: (index: number, field: keyof RuleFormData, value: string | string[] | number) => void
  categories?: { id: number; name: string }[]
  segments?: { id: number; name: string }[]
  paymentMethods?: { id: number; name: string }[]
  paymentConditions?: { id: number; name: string }[]
  customers?: { id: number; corporateName: string; fantasyName?: string | null; document?: string | null }[]
}

const BRAZILIAN_STATES = Object.values(CountryState).map(state => ({
  label: state,
  value: state
}))

export function PriceTableRulesEditor({
  rules,
  onAddRule,
  onRemoveRule,
  onUpdateRule,
  categories = [],
  segments = [],
  paymentMethods = [],
  paymentConditions = [],
  customers = []
}: PriceTableRulesEditorProps): JSX.Element {
  const categoryOptions = categories.map(cat => ({
    label: cat.name,
    value: String(cat.id)
  }))

  const segmentOptions = segments.map(seg => ({
    label: seg.name,
    value: String(seg.id)
  }))

  const paymentMethodOptions = paymentMethods.map(pm => ({
    label: pm.name,
    value: String(pm.id)
  }))

  const paymentConditionOptions = paymentConditions.map(pc => ({
    label: pc.name,
    value: String(pc.id)
  }))

  const customerOptions = customers.map(cust => ({
    label: cust.corporateName + (cust.fantasyName ? ` - ${cust.fantasyName}` : '') + (cust.document ? ` (${cust.document})` : ''),
    value: String(cust.id)
  }))

  const renderFieldSelector = (rule: RuleFormData, index: number) => {
    const selectedField = rule.field

    if (selectedField === 'state') {
      return (
        <div>
          <label className='text-xs text-muted-foreground'>Estado(s)</label>
          <MultiSelect
            options={BRAZILIAN_STATES}
            onValueChange={(values) => onUpdateRule(index, 'values', values)}
            defaultValue={rule.values || []}
            placeholder='Selecionar estados'
            maxCount={3}
          />
        </div>
      )
    }

    if (selectedField === 'productCategoryId') {
      return (
        <div>
          <label className='text-xs text-muted-foreground'>Categoria(s) de Produto</label>
          <MultiSelect
            options={categoryOptions}
            onValueChange={(values) => onUpdateRule(index, 'values', values)}
            defaultValue={rule.values || []}
            placeholder='Selecionar categorias'
            maxCount={3}
          />
        </div>
      )
    }

    if (selectedField === 'segmentId') {
      return (
        <div>
          <label className='text-xs text-muted-foreground'>Segmento(s)</label>
          <MultiSelect
            options={segmentOptions}
            onValueChange={(values) => onUpdateRule(index, 'values', values)}
            defaultValue={rule.values || []}
            placeholder='Selecionar segmentos'
            maxCount={3}
          />
        </div>
      )
    }

    if (selectedField === 'minimumOrderValue') {
      return (
        <div>
          <label className='text-xs text-muted-foreground'>Valor Mínimo do Pedido</label>
          <Input
            type='text'
            inputMode='decimal'
            placeholder='0,00'
            value={rule.minimumOrderValue || ''}
            onChange={e => onUpdateRule(index, 'minimumOrderValue', e.target.value)}
            className='h-8'
          />
        </div>
      )
    }

    if (selectedField === 'paymentMethodId') {
      return (
        <div>
          <label className='text-xs text-muted-foreground'>Método(s) de Pagamento</label>
          <MultiSelect
            options={paymentMethodOptions}
            onValueChange={(values) => onUpdateRule(index, 'values', values)}
            defaultValue={rule.values || []}
            placeholder='Selecionar métodos'
            maxCount={3}
          />
        </div>
      )
    }

    if (selectedField === 'paymentConditionId') {
      return (
        <div>
          <label className='text-xs text-muted-foreground'>Condição(ões) de Pagamento</label>
          <MultiSelect
            options={paymentConditionOptions}
            onValueChange={(values) => onUpdateRule(index, 'values', values)}
            defaultValue={rule.values || []}
            placeholder='Selecionar condições'
            maxCount={3}
          />
        </div>
      )
    }

    if (selectedField === 'customerId') {
      return (
        <div>
          <label className='text-xs text-muted-foreground'>Cliente(s)</label>
          <MultiSelect
            options={customerOptions}
            onValueChange={(values) => onUpdateRule(index, 'values', values)}
            defaultValue={rule.values || []}
            placeholder='Selecionar clientes'
            maxCount={3}
            className='truncate'
          />
        </div>
      )
    }

    return (
      <div>
        <label className='text-xs text-muted-foreground'>Valor</label>
        <Input
          placeholder={rule.operator === 'IN' ? 'valor1, valor2' : 'Valor'}
          value={rule.value}
          onChange={e => onUpdateRule(index, 'value', e.target.value)}
          className='h-8'
        />
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <FormLabel>Regras de Preço</FormLabel>
        <Button type='button' variant='outline' size='sm' onClick={onAddRule}>
          <Plus className='h-4 w-4 mr-1' />
          Adicionar Regra
        </Button>
      </div>

      {rules.map((rule, index) => (
        <div key={index} className='flex gap-2 items-start p-3 border rounded-md bg-muted/30'>
          <div className='flex-1 space-y-2'>
            <div>
              <label className='text-xs text-muted-foreground'>Campo</label>
              <Select value={rule.field} onValueChange={v => onUpdateRule(index, 'field', v)}>
                <SelectTrigger className='h-8'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='paymentConditionId'>Condição de Pagamento</SelectItem>
                  <SelectItem value='state'>Estado</SelectItem>
                  <SelectItem value='paymentMethodId'>Método de Pagamento</SelectItem>
                  <SelectItem value='productCategoryId'>Categoria de Produto</SelectItem>
                  <SelectItem value='segmentId'>Segmento</SelectItem>
                  <SelectItem value='minimumOrderValue'>Valor Mínimo do Pedido</SelectItem>
                  <SelectItem value='customerId'>Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-xs text-muted-foreground'>Operador</label>
              <Select
                value={rule.operator}
                onValueChange={v => onUpdateRule(index, 'operator', v)}
                disabled={rule.field === 'state' || rule.field === 'productCategoryId' || rule.field === 'minimumOrderValue' || rule.field === 'segmentId' || rule.field === 'paymentMethodId' || rule.field === 'paymentConditionId' || rule.field === 'customerId'}
              >
                <SelectTrigger className='h-8'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='CONTAINS'>Contém</SelectItem>
                  <SelectItem value='EQUALS'>Igual</SelectItem>
                  <SelectItem value='GREATER_THAN'>Maior que</SelectItem>
                  <SelectItem value='IN'>Em</SelectItem>
                  <SelectItem value='LESS_THAN'>Menor que</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderFieldSelector(rule, index)}
          </div>
          <Button type='button' variant='ghost' size='icon' className='mt-4' onClick={() => onRemoveRule(index)}>
            <Trash2 className='h-4 w-4 text-destructive' />
          </Button>
        </div>
      ))}
    </div>
  )
}