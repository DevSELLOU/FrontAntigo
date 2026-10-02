'use client'

import { ListingPageHeader } from '@/components/shared/listing-page-header'
import type { UserHierarchy } from '@/interfaces/user-hierarchy.interface'
import { User } from '@/interfaces/user.interface'
import { Network } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { CreateUserHierarchyModal } from './create-user-hierarchy-modal'
import UserRow from './user-row'

interface CompanyUserHierarchyProps {
  hierarchyData: UserHierarchy[]
  usersData: User[]
  companyId: number
}

/**
 * Search stays client-side here, unlike every other listing: the tree arrives whole and a match
 * has to keep the ancestors of the matching node visible, which a paginated server query can't
 * express. (The filter below already existed; the input that fed it was never rendered.)
 */
function filterHierarchy(users: UserHierarchy[], term: string): UserHierarchy[] {
  const lowercasedFilter = term.toLowerCase()

  return users.reduce<UserHierarchy[]>((acc, user) => {
    const nameMatch = user.name.toLowerCase().includes(lowercasedFilter)
    const roleMatch = user.role.toLowerCase().includes(lowercasedFilter)
    const subordinates = user.subordinates ? filterHierarchy(user.subordinates, term) : []

    if (nameMatch || roleMatch || subordinates.length > 0) {
      acc.push({ ...user, subordinates })
    }

    return acc
  }, [])
}

export function CompanyUserHierarchy({ hierarchyData, usersData, companyId }: CompanyUserHierarchyProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredUsers = useMemo(
    () => (searchTerm.trim() ? filterHierarchy(hierarchyData, searchTerm) : hierarchyData),
    [searchTerm, hierarchyData]
  )

  // The page is a server component, so a change only shows up after re-rendering it. Creating or
  // removing a link used to leave the tree on screen exactly as it was.
  const refresh = () => router.refresh()

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ListingPageHeader
        card
        icon={<Network className='h-5 w-5' />}
        eyebrow='Gerenciamento'
        title='Hierarquia'
        description='Defina quem responde a quem na equipe comercial.'
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        showViewSelector={false}
        primaryAction={{ label: 'Vínculo', onClick: () => setIsCreateModalOpen(true) }}
      />

      <div className='rounded-2xl border border-border bg-surface shadow-sm'>
        {filteredUsers?.length > 0 ? (
          filteredUsers.map(user => (
            <UserRow key={user.id} user={user} level={0} companyId={companyId} onUserDeleted={refresh} />
          ))
        ) : (
          <div className='flex min-h-60 items-center justify-center p-10 text-center text-body text-text-muted'>
            {searchTerm ? 'Nenhum usuário encontrado para esta busca.' : 'Nenhum vínculo de hierarquia cadastrado.'}
          </div>
        )}
      </div>

      <CreateUserHierarchyModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        usersData={usersData}
        companyId={companyId}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          refresh()
        }}
      />
    </div>
  )
}
