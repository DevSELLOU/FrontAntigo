'use client'

import { CircleDollarSign, Layers, Target, TrendingUp, UserCheck, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  GOAL_MONTH_FULL_NAMES,
  GOAL_MONTH_NAMES,
  formatGoalCurrency
} from '@/components/my-goals/goal-format'
import { GoalKpiCard } from '@/components/my-goals/goal-kpi-card'
import { ProgressBar } from '@/components/shared/progress-bar'
import { GoalsEvolutionChart } from '@/components/my-goals/goals-evolution-chart'
import { GoalsList } from '@/components/my-goals/goals-list'
import { MyGoalsSkeleton } from '@/components/my-goals/my-goals-skeleton'
import { PeriodSelect } from '@/components/my-goals/period-select'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { GoalsDashboardSummary } from '@/interfaces/user-goal.interface'
import { clientFetch } from '@/utils/client-fetch.util'

interface PageProps {
  params: {
    companyId: number
  }
}

export default function MyGoalsPage({ params }: PageProps) {
  const { companyId } = params
  const { user, isLoading: isAuthLoading } = useAuth()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [data, setData] = useState<GoalsDashboardSummary | null>(null)

  const userId = user?.id

  const fetchDashboardData = useCallback(
    async (currentUserId: number, year: number, month?: number) => {
      setIsLoading(true)
      setHasError(false)
      try {
        const queryParams = new URLSearchParams()
        queryParams.set('year', year.toString())
        queryParams.set('userId', currentUserId.toString())
        if (month) queryParams.set('month', month.toString())

        const response = (await clientFetch<{ data: GoalsDashboardSummary }>(
          `/company/${companyId}/user-goals/dashboard/summary?${queryParams.toString()}`,
          { method: 'GET' }
        )) as { data: GoalsDashboardSummary }

        setData(response.data)
      } catch (error) {
        console.error('Failed to fetch goals data:', error)
        setData(null)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    },
    [companyId]
  )

  useEffect(() => {
    if (!userId) return
    fetchDashboardData(userId, selectedYear, selectedMonth)
  }, [userId, selectedYear, selectedMonth, fetchDashboardData])

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const yearOptions = [currentYear, currentYear - 1].map(year => ({
    value: year.toString(),
    label: year.toString()
  }))

  const monthOptions = [
    { value: '', label: 'Todos os meses' },
    ...GOAL_MONTH_FULL_NAMES.map((name, index) => ({ value: (index + 1).toString(), label: name }))
  ]

  const periodLabel = selectedMonth
    ? `${GOAL_MONTH_FULL_NAMES[selectedMonth - 1]} de ${selectedYear}`
    : `Consolidado em ${selectedYear}`

  const header = (
    <ListingPageHeader
      card
      icon={<TrendingUp className='h-5 w-5' />}
      eyebrow='Desempenho comercial'
      title='Minhas metas'
      description='Acompanhe seu progresso e veja quanto falta para bater a meta do período.'
      showViewSelector={false}
      secondaryActions={
        <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
          <PeriodSelect
            label='Ano'
            options={yearOptions}
            value={selectedYear.toString()}
            onChange={value => setSelectedYear(Number(value))}
            className='sm:w-[120px]'
          />
          <PeriodSelect
            label='Mês'
            options={monthOptions}
            value={selectedMonth ? selectedMonth.toString() : ''}
            onChange={value => setSelectedMonth(value ? Number(value) : undefined)}
            className='sm:w-[180px]'
          />
        </div>
      }
    />
  )

  const isBusy = isAuthLoading || !user || isLoading

  if (isBusy) {
    return (
      <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
        {header}
        <MyGoalsSkeleton />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
        {header}
        <section className='rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm'>
          <h2 className='text-h3 text-text'>Não foi possível carregar suas metas.</h2>
          <p className='mx-auto mt-1 max-w-md text-body text-text-muted'>
            Verifique sua conexão e tente novamente.
          </p>
          <Button
            type='button'
            className='mt-5 h-11 px-6'
            onClick={() => userId && fetchDashboardData(userId, selectedYear, selectedMonth)}
          >
            Tentar novamente
          </Button>
        </section>
      </div>
    )
  }

  if (!data || !data.goals || data.goals.length === 0) {
    return (
      <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
        {header}
        <section className='rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm'>
          <span className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--glass-icon-bg)] text-[#008440]'>
            <Target className='h-6 w-6' />
          </span>
          <h2 className='mt-4 text-h3 text-text'>Nenhuma meta encontrada</h2>
          <p className='mx-auto mt-1 max-w-md text-body text-text-muted'>
            Você não possui metas cadastradas para {selectedYear}. Fale com seu gestor para definir as metas do
            período.
          </p>
        </section>
      </div>
    )
  }

  const valuePercentage = data?.metaValue ? Math.round((data.totalValue / data.metaValue) * 100) : 0
  const clientsPercentage = data?.metaClients ? Math.round((data.totalClients / data.metaClients) * 100) : 0
  const productMixPercentage = data?.metaProductMix ? Math.round((data.productMix / data.metaProductMix) * 100) : 0
  const activeClients = data?.activeClientsPercent || 0

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      {header}

      {/* Global attainment */}
      <section className='relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-surface)] p-5 shadow-sm backdrop-blur-sm sm:p-6'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#35DD48]/15 blur-3xl'
        />

        <div className='relative flex flex-col gap-4'>
          <div className='flex flex-wrap items-end justify-between gap-3'>
            <div className='min-w-0'>
              <p className='text-xs font-semibold uppercase tracking-[0.08em] text-text-muted'>
                Atingimento global
              </p>
              <p className='mt-1 text-metric tabular-nums text-[#008440]'>
                {data.globalAttainment.toFixed(1)}%
              </p>
            </div>
            <p className='text-caption text-text-muted'>{periodLabel}</p>
          </div>

          <ProgressBar
            percentage={data.globalAttainment}
            label={`Atingimento global: ${data.globalAttainment.toFixed(1)}%`}
            className='h-2.5'
          />
        </div>
      </section>

      {/* Indicators */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <GoalKpiCard
          label='Valor total'
          value={formatGoalCurrency(data.totalValue)}
          meta={`Meta: ${formatGoalCurrency(data.metaValue)}`}
          percentage={valuePercentage}
          icon={<CircleDollarSign className='h-5 w-5' />}
        />

        <GoalKpiCard
          label='Total de clientes'
          value={data.totalClients}
          meta={`Meta: ${data.metaClients}`}
          percentage={clientsPercentage}
          icon={<Users className='h-5 w-5' />}
        />

        <GoalKpiCard
          label='Clientes ativos'
          value={`${activeClients}%`}
          meta='Média do período'
          percentage={activeClients}
          icon={<UserCheck className='h-5 w-5' />}
        />

        <GoalKpiCard
          label='Mix de produtos'
          value={
            <>
              {data.productMix.toLocaleString('pt-BR')}{' '}
              <span className='text-sm font-normal text-text-muted'>un</span>
            </>
          }
          meta={`Meta: ${data.metaProductMix.toLocaleString('pt-BR')}`}
          percentage={productMixPercentage}
          icon={<Layers className='h-5 w-5' />}
        />
      </div>

      <GoalsEvolutionChart
        byMonth={data.byMonth}
        monthNames={GOAL_MONTH_NAMES}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        currentMonth={currentMonth}
        isCurrentYear={selectedYear === currentYear}
      />

      <GoalsList
        title={selectedMonth ? `${GOAL_MONTH_FULL_NAMES[selectedMonth - 1]} de ${selectedYear}` : `Metas de ${selectedYear}`}
        goals={data.goals}
      />
    </div>
  )
}
