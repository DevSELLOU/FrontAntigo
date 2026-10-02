'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { UserGoal } from '@/interfaces/user-goal.interface'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { RemoveUserGoalModal } from './remove-user-goal-modal'
import { UpdateUserGoalModal } from './update-user-goal-modal'

interface UserGoalsTableProps {
  goals: UserGoal[]
  companyId: number
}

const GOAL_TYPE_LABELS: Record<string, string> = {
  sales_value: 'Valor de Vendas',
  active_clients: 'Clientes Ativos',
  new_clients: 'Novos Clientes',
  product_sales: 'Vendas de Produtos'
}

export function UserGoalsTable({ goals, companyId }: UserGoalsTableProps) {
  const [updateGoal, setUpdateGoal] = useState<UserGoal | null>(null)
  const [removeGoal, setRemoveGoal] = useState<UserGoal | null>(null)

  const formatValue = (value: number | null | undefined, type: string): string => {
    if (value === null || value === undefined) return '-'
    if (type === 'sales_value') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }
    return value.toString()
  }

  const formatPeriod = (goal: UserGoal): string => {
    if (goal.startDate && goal.endDate) {
      const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-')
        return `${day}/${month}/${year}`
      }
      return `${formatDate(goal.startDate)} - ${formatDate(goal.endDate)}`
    }
    return '-'
  }

  const calculateProgress = (current: number | null | undefined, target: number): number => {
    if (current === null || current === undefined) return 0
    return Math.min(100, Math.round((current / target) * 100))
  }

  return (
    <>
      <div className='rounded-md border overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className='text-right'>Meta</TableHead>
              <TableHead className='text-right'>Atual</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-24 text-center'>
                  Nenhuma meta encontrada.
                </TableCell>
              </TableRow>
            ) : (
              goals.map(goal => {
                const progress = calculateProgress(goal.currentValue, goal.targetValue)
                return (
                  <TableRow key={goal.id}>
                    <TableCell className='font-medium'>{goal.user?.name || 'N/A'}</TableCell>
                    <TableCell>{formatPeriod(goal)}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{GOAL_TYPE_LABELS[goal.type] || goal.type}</Badge>
                    </TableCell>
                    <TableCell className='text-right'>{formatValue(goal.targetValue, goal.type)}</TableCell>
                    <TableCell className='text-right'>{formatValue(goal.currentValue, goal.type)}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <div className='w-24 h-2 bg-gray-200 rounded-full overflow-hidden'>
                          <div className='h-full bg-green-600 transition-all' style={{ width: `${progress}%` }} />
                        </div>
                        <span className='text-sm text-muted-foreground'>{progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => setUpdateGoal(goal)}>
                            <Pencil className='mr-2 h-4 w-4' />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRemoveGoal(goal)} className='text-destructive'>
                            <Trash2 className='mr-2 h-4 w-4' />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {updateGoal && (
        <UpdateUserGoalModal
          goal={updateGoal}
          open={!!updateGoal}
          onClose={() => setUpdateGoal(null)}
          companyId={companyId}
        />
      )}

      {removeGoal && (
        <RemoveUserGoalModal
          goal={removeGoal}
          open={!!removeGoal}
          onClose={() => setRemoveGoal(null)}
          companyId={companyId}
        />
      )}
    </>
  )
}
