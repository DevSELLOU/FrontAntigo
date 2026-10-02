import { Target } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserGoal } from '@/interfaces/user-goal.interface'
import { GOAL_TYPE_LABELS, formatGoalDate, formatGoalValue } from './goal-format'
import { ProgressBar } from '@/components/shared/progress-bar'

interface GoalsListProps {
  title: string
  goals: UserGoal[]
}

interface GoalRow {
  id: number
  type: string
  typeLabel: string
  target: string
  current: string
  period: string
  percentage: number
}

function buildRows(goals: UserGoal[]): GoalRow[] {
  return goals.map(goal => {
    const percentage = goal.targetValue > 0 ? ((goal.currentValue || 0) / goal.targetValue) * 100 : 0

    return {
      id: goal.id,
      type: goal.type,
      typeLabel: GOAL_TYPE_LABELS[goal.type] || goal.type,
      target: formatGoalValue(Number(goal.targetValue), goal.type),
      current: formatGoalValue(Number(goal.currentValue) || 0, goal.type),
      period:
        goal.startDate && goal.endDate
          ? `${formatGoalDate(goal.startDate)} — ${formatGoalDate(goal.endDate)}`
          : '-',
      percentage
    }
  })
}

function GoalStatus({ percentage }: { percentage: number }) {
  return percentage >= 100 ? (
    <StatusBadge variant='success'>Meta atingida</StatusBadge>
  ) : (
    <StatusBadge variant='neutral'>Em andamento</StatusBadge>
  )
}

export function GoalsList({ title, goals }: GoalsListProps) {
  const rows = buildRows(goals)

  return (
    <section className='overflow-hidden rounded-2xl border border-border bg-surface shadow-sm'>
      <header className='flex items-center gap-3 border-b border-border px-5 py-4'>
        <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--glass-icon-bg)] text-[#008440]'>
          <Target className='h-[18px] w-[18px]' />
        </span>
        <h2 className='min-w-0 text-h3 text-text'>{title}</h2>
      </header>

      {rows.length === 0 ? (
        <p className='px-5 py-8 text-center text-body text-text-muted'>
          Nenhuma meta encontrada para o período selecionado.
        </p>
      ) : (
        <>
          {/* Mobile: one card per goal — a 6-column table would force horizontal scrolling at 360px. */}
          <ul className='divide-y divide-border md:hidden'>
            {rows.map(row => (
              <li key={row.id} className='space-y-3 px-4 py-4'>
                <div className='flex items-start justify-between gap-3'>
                  <h3 className='min-w-0 text-label text-text'>{row.typeLabel}</h3>
                  <GoalStatus percentage={row.percentage} />
                </div>

                <dl className='grid grid-cols-3 gap-3 text-caption'>
                  <div className='min-w-0'>
                    <dt className='text-text-muted'>Meta</dt>
                    <dd className='truncate font-medium tabular-nums text-text'>{row.target}</dd>
                  </div>
                  <div className='min-w-0'>
                    <dt className='text-text-muted'>Atual</dt>
                    <dd className='truncate font-medium tabular-nums text-text'>{row.current}</dd>
                  </div>
                  <div className='min-w-0'>
                    <dt className='text-text-muted'>Atingimento</dt>
                    <dd className='truncate font-semibold tabular-nums text-[#008440]'>
                      {row.percentage.toFixed(1)}%
                    </dd>
                  </div>
                </dl>

                <ProgressBar
                  percentage={row.percentage}
                  label={`${row.typeLabel}: ${row.percentage.toFixed(1)}% da meta`}
                />

                <p className='text-caption text-text-muted'>Período: {row.period}</p>
              </li>
            ))}
          </ul>

          {/* Desktop: full comparison table. */}
          <div className='hidden md:block'>
            <table className='w-full text-left text-body'>
              <thead className='border-b border-border bg-surface-muted'>
                <tr className='text-caption uppercase tracking-[0.08em] text-text-muted'>
                  <th scope='col' className='px-5 py-3 font-semibold'>
                    Tipo
                  </th>
                  <th scope='col' className='px-5 py-3 font-semibold'>
                    Meta
                  </th>
                  <th scope='col' className='px-5 py-3 font-semibold'>
                    Atual
                  </th>
                  <th scope='col' className='px-5 py-3 font-semibold'>
                    Período
                  </th>
                  <th scope='col' className='px-5 py-3 font-semibold'>
                    Atingimento
                  </th>
                  <th scope='col' className='px-5 py-3 font-semibold'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {rows.map(row => (
                  <tr key={row.id} className='transition-colors hover:bg-surface-muted'>
                    <td className='px-5 py-3.5 text-text'>{row.typeLabel}</td>
                    <td className='px-5 py-3.5 tabular-nums text-text-body'>{row.target}</td>
                    <td className='px-5 py-3.5 tabular-nums text-text-body'>{row.current}</td>
                    <td className='px-5 py-3.5 tabular-nums text-text-muted'>{row.period}</td>
                    <td className='px-5 py-3.5 font-semibold tabular-nums text-[#008440]'>
                      {row.percentage.toFixed(1)}%
                    </td>
                    <td className='px-5 py-3.5'>
                      <GoalStatus percentage={row.percentage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
