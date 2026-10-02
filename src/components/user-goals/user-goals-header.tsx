import { GenericHeaderTitle } from '../admin/generic-header-title'
import { CreateUserGoalButton } from './create-user-goal-button'

export function UserGoalsHeader({ companyId }: { companyId: number }) {
  return (
    <div className='flex items-center justify-between gap-4'>
      <GenericHeaderTitle title='Metas' description='Gerencie as metas dos vendedores.' />
      <CreateUserGoalButton companyId={companyId} />
    </div>
  )
}