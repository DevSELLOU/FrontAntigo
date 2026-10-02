'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { UserHierarchy } from '@/interfaces/user-hierarchy.interface'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, Trash2, User, Users } from 'lucide-react'
import React, { useState } from 'react'

import { deleteUserHierarchyAction } from '@/actions/user-hierarchy/delete-user-hierarchy.action'
import { useToast } from '@/hooks/use-toast'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'

interface UserRowProps {
  user: UserHierarchy
  level: number
  companyId: number
  onUserDeleted?: () => void
}

const UserRow: React.FC<UserRowProps> = ({ user, level, companyId, onUserDeleted }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const hasSubordinates = Boolean(user.subordinates && user.subordinates.length > 0)
  const subordinateCount = user.subordinates?.length ?? 0

  const handleDelete = async () => {
    if (!user.managerId) {
      toast({ title: 'Este usuário não tem vínculo para remover', status: 'error' })
      return
    }

    if (!confirm(`Tem certeza que deseja remover ${user.name} da hierarquia?`)) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await deleteUserHierarchyAction(companyId, user.id)

      if (isApiErrorResponse(response)) {
        throw new Error(response.message)
      }

      toast({ title: `${user.name} saiu da hierarquia`, status: 'success' })
      onUserDeleted?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover o vínculo'
      toast({ title: message, status: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className='w-full'>
        <div
          className={cn(
            'flex items-center justify-between gap-4 border-b border-border p-4 transition-colors hover:bg-surface-muted',
            level > 0 && 'border-l-2 border-l-border'
          )}
          style={{ paddingLeft: `${1 + level * 1.5}rem` }}
        >
          <div className='flex min-w-0 items-center gap-4'>
            <div className='relative shrink-0'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-muted'>
                <User className='h-6 w-6 text-text-muted' />
              </div>
              {hasSubordinates && (
                <div className='absolute -bottom-1 -right-1 rounded-full bg-[#008440] p-1 text-white'>
                  <Users className='h-3 w-3' />
                </div>
              )}
            </div>

            <div className='min-w-0'>
              <div className='truncate text-label text-text'>{user.name}</div>
              <div className='truncate text-caption text-text-muted'>{user.role}</div>
              {hasSubordinates && (
                <div className='mt-1 text-caption text-text-muted'>
                  {subordinateCount} {subordinateCount === 1 ? 'subordinado' : 'subordinados'}
                </div>
              )}
            </div>
          </div>

          <div className='flex shrink-0 items-center gap-1'>
            {user.managerId && (
              <RowActionButton
                label={`Remover ${user.name} da hierarquia`}
                onClick={handleDelete}
                disabled={isDeleting}
                className='hover:text-danger-foreground'
              >
                <Trash2 className='h-4 w-4' />
              </RowActionButton>
            )}

            {hasSubordinates && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-expanded={!isCollapsed}
                aria-label={
                  isCollapsed ? `Mostrar subordinados de ${user.name}` : `Ocultar subordinados de ${user.name}`
                }
                className='text-text-muted hover:text-text-body'
              >
                {isCollapsed ? <ChevronRight className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
              </Button>
            )}
          </div>
        </div>

        {hasSubordinates && !isCollapsed && (
          <div className='bg-surface-muted/50'>
            {user.subordinates?.map(subordinate => (
              <UserRow
                key={subordinate.id}
                user={subordinate}
                level={level + 1}
                companyId={companyId}
                onUserDeleted={onUserDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

export default UserRow
