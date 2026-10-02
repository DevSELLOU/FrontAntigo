'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GenericRevenueChartResponse } from '@/interfaces/dashboard/generic-revenue-chart-response.interface'
import { formatDashboardLabel } from '@/utils/format/format-bar-label.util'
import { formatCurrency } from '@/utils/format/format-currency'
import { Expand } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

interface GenericOrdersChartProps {
  title: string
  description: string
  data: GenericRevenueChartResponse[]
  className?: string
  sortByValue?: boolean
}

const chartConfig = {
  totalRevenue: {
    label: 'Receita',
    color: 'var(--custom-color, var(--action))'
  }
} satisfies ChartConfig

export function GenericRevenueBarChart({
  title,
  description,
  data,
  className,
  sortByValue = false
}: GenericOrdersChartProps) {
  const isUniqueData = data?.length === 1
  const chartData = isUniqueData ? data : data?.slice(0, 5)
  const itemData = sortByValue ? chartData.sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue)) : chartData
  const maxRevenue = Math.max(...itemData.map(item => Number(item.totalRevenue)))
  const yAxisDomain = [0, maxRevenue + maxRevenue * 0.1]
  const xAxisCustomProps = isUniqueData ? {} : { angle: -45, height: 60, textAnchor: 'end' as const }

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <FullViewButton title={title} description={description} data={itemData} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='aspect-[16/10] w-full'>
          <BarChart
            accessibilityLayer
            data={itemData}
            margin={{ top: 24, right: 24, bottom: 48, left: 24 }}
            className='[&_.recharts-cartesian-grid-horizontal_line]:stroke-border [&_.recharts-cartesian-grid-vertical_line]:stroke-border'
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='label'
              tickLine={false}
              axisLine={false}
              tickFormatter={label => formatDashboardLabel({ label, isShortLabel: !isUniqueData })}
              className='text-xs'
              {...xAxisCustomProps}
            />
            <YAxis axisLine={false} tickLine={false} domain={yAxisDomain} className='text-xs' />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey='totalRevenue' fill={chartConfig.totalRevenue.color} radius={8}>
              <LabelList position='top' offset={12} className='fill-foreground' fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function FullViewButton({ title, description, data }: GenericOrdersChartProps) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button size='icon' variant='outline'>
          <Expand size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {title} ({data?.length})
              </TableHead>
              <TableHead className='text-right'>Receita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map(item => (
              <TableRow key={item?.label}>
                <TableCell>{formatDashboardLabel({ label: item?.label, isShortLabel: false })}</TableCell>
                <TableCell className='text-right'>{formatCurrency(Number(item?.totalRevenue))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
