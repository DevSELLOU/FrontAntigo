'use client'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  addYears,
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subYears
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'


export function MonthYearPicker(props: any) {
  const { mode = 'single', selectedMonths, selectedYears, onMonthSelect, onYearSelect } = props
  const [viewDate, setViewDate] = useState(
    (mode === 'multiple' && selectedMonths && selectedMonths.length > 0 ? selectedMonths[0] : new Date())
  )

  const handleMonthSelect = (monthDate: Date) => {
    if (mode === 'multiple') {
      onMonthSelect(monthDate)
    }else if (mode === 'single') {
      onMonthSelect({
        from: startOfMonth(monthDate),
        to: endOfMonth(monthDate)
      })
    }
  }

  const handleYearSelect = (year: number) => {
    if (mode === 'multiple') {
      onYearSelect(year)
    } else if (mode === 'single') {
      const yearDate = new Date(year, 0, 1)
      props.onSelect({
        from: startOfYear(yearDate),
        to: endOfYear(yearDate)
      })
    }
  }

  const months = eachMonthOfInterval({
    start: startOfYear(viewDate),
    end: endOfYear(viewDate)
  })

  const years = Array.from({ length: 12 }, (_, i) => viewDate.getFullYear() - 5 + i)

  return (
    <Tabs defaultValue='month' className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='month'>Mês</TabsTrigger>
        <TabsTrigger value='year'>Ano</TabsTrigger>
      </TabsList>
      <TabsContent value='month' className='mt-4'>
        <div className='flex items-center justify-center gap-4 mb-4'>
          <Button variant='outline' size='icon' onClick={() => setViewDate(subYears(viewDate, 1))}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <div className='font-bold text-center w-24'>{format(viewDate, 'yyyy')}</div>
          <Button variant='outline' size='icon' onClick={() => setViewDate(addYears(viewDate, 1))}>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
        <div className='grid grid-cols-3 gap-2'>
          {months.map(month => (
            <Button
              key={month.toString()}
              variant={
                mode === 'multiple' &&
                selectedMonths?.some(
                  (d: { getFullYear: () => any; getMonth: () => any }) => d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()
                )
                  ? 'default'
                  : 'ghost'
              }
              className='capitalize'
              onClick={() => handleMonthSelect(month)}
            >
              {format(month, 'MMM', { locale: ptBR })}
            </Button>
          ))}
        </div>
      </TabsContent>
      <TabsContent value='year' className='mt-4'>
        <div className='flex items-center justify-center gap-4 mb-4'>
          <Button variant='outline' size='icon' onClick={() => setViewDate(subYears(viewDate, 12))}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <div className='font-bold text-center w-24'>{`${years[0]} - ${years[years.length - 1]}`}</div>
          <Button variant='outline' size='icon' onClick={() => setViewDate(addYears(viewDate, 12))}>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
        <div className='grid grid-cols-3 gap-2'>
          {years.map(year => (
            <Button
              key={year}
              variant={
                mode === 'multiple' && selectedYears?.some((y: number) => y === year)
                  ? 'default'
                  : 'ghost'
              }
              onClick={() => handleYearSelect(year)}>
              {year}
            </Button>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
