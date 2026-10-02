'use client'

import { UseFormReturn } from 'react-hook-form'
import { PriceTableDto } from '@/types/dto/price-table-dto'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface PriceTableFormFieldsProps {
  form: UseFormReturn<PriceTableDto>
}

export function PriceTableFormFields({ form }: PriceTableFormFieldsProps): JSX.Element {
  return (
    <>
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input placeholder='Ex. Tabela de preço 1' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='description'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea
                className='resize-none'
                placeholder='Ex. Tabela de preço para produtos de limpeza'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='adjustmentType'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Ajuste</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o tipo de ajuste' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='PERCENTAGE_DISCOUNT'>Desconto (%)</SelectItem>
                  <SelectItem value='PERCENTAGE_MARKUP'>Acréscimo (%)</SelectItem>
                  <SelectItem value='FIXED_VALUE'>Valor Fixo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='adjustmentValue'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Ajuste</FormLabel>
              <FormControl>
                <Input
                  type='text'
                  inputMode='decimal'
                  placeholder='0,00'
                  onChange={e => field.onChange(e.target.value)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}