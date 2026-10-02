import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input, InputProps } from '@/components/ui/input'
import { formatCurrency } from '@/utils/format/format-currency'
import { useEffect, useReducer } from 'react'
import { FieldValues, Path, useFormContext } from 'react-hook-form'

export type InputCurrencyProps<T extends FieldValues> = InputProps & {
  name: Path<T>
  label?: string
  formItemClass?: string
}

function InputCurrency<T extends FieldValues>({ name, label, formItemClass, ...props }: InputCurrencyProps<T>) {
  const { watch, control } = useFormContext()
  const formValue = watch(name)

  const [value, setValue] = useReducer((_: string, next: string) => {
    if (next === '') return ''
    const numericValue = Number(next.replace(/\D/g, '')) / 100
    return formatCurrency(numericValue)
  }, '')

  useEffect(() => {
    setValue(formatCurrency(formValue || 0))
  }, [formValue])

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={formItemClass}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              id={name}
              type='text'
              {...props}
              {...field}
              onChange={ev => {
                const inputValue = ev.target.value
                setValue(inputValue)
                const numericValue = Number(inputValue.replace(/\D/g, '')) / 100
                field.onChange(numericValue)
              }}
              value={value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default InputCurrency
