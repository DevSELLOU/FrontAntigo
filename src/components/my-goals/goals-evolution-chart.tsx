import { BarChart3 } from 'lucide-react'

interface GoalsEvolutionChartProps {
  byMonth: { month: number; actual: number; goal: number }[]
  monthNames: string[]
  selectedMonth?: number
  selectedYear: number
  currentMonth: number
  isCurrentYear: boolean
}

export function GoalsEvolutionChart({
  byMonth,
  monthNames,
  selectedMonth,
  selectedYear,
  currentMonth,
  isCurrentYear
}: GoalsEvolutionChartProps) {
  return (
    <section className='rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6'>
      <div className='mb-6 flex items-center gap-3'>
        <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--glass-icon-bg)] text-[#008440]'>
          <BarChart3 className='h-[18px] w-[18px]' />
        </span>
        <div className='min-w-0'>
          <h2 className='text-h3 text-text'>
            {selectedMonth ? `Evolução: ${monthNames[0]} — ${monthNames[selectedMonth - 1]}` : 'Evolução por mês'}
          </h2>
          <p className='text-caption text-text-muted'>Atingimento da meta em cada mês de {selectedYear}.</p>
        </div>
      </div>

      <div className='flex h-52 items-end justify-between gap-1 border-b border-border pb-2 sm:h-64 sm:gap-2'>
        {byMonth
          .filter(m => !selectedMonth || m.month <= selectedMonth)
          .map(month => {
            const percentage = month.goal > 0 ? (month.actual / month.goal) * 100 : 0
            const isInProgress = month.month === currentMonth && isCurrentYear
            const isPast = month.month < currentMonth
            const filled = isPast || (selectedMonth && month.month <= selectedMonth)

            return (
              <div key={month.month} className='flex flex-1 flex-col items-center gap-2'>
                <div
                  title={
                    isInProgress
                      ? `${monthNames[month.month - 1]}: mês em curso`
                      : `${monthNames[month.month - 1]}: ${percentage.toFixed(1)}% da meta`
                  }
                  className={`relative w-full rounded-t-md ${
                    isInProgress
                      ? 'flex h-[60%] items-center justify-center border-2 border-dashed border-border'
                      : 'h-[70%] bg-surface-muted'
                  }`}
                >
                  {isInProgress ? (
                    <span className='rotate-90 whitespace-nowrap text-[10px] font-medium text-text-muted'>EM CURSO</span>
                  ) : (
                    <div
                      className={`absolute inset-x-0 bottom-0 rounded-t-md bg-gradient-to-t transition-[height] duration-500 motion-reduce:transition-none ${
                        percentage > 100 ? 'from-[#008440] to-[#35DD48]' : 'from-[#006631] to-[#008440]'
                      }`}
                      style={{ height: filled ? `${Math.min(percentage, 100)}%` : '0%' }}
                    />
                  )}
                </div>
                <span className='text-[10px] font-medium text-text-muted sm:text-xs'>
                  {monthNames[month.month - 1]}
                </span>
              </div>
            )
          })}

        {selectedMonth
          ? [...Array(12 - selectedMonth)].map((_, i) => (
              <div key={`empty-${i}`} className='h-full flex-1 rounded-t-md border-x border-border bg-surface-muted/60' />
            ))
          : null}
      </div>
    </section>
  )
}
