'use client'

import { Button } from '@/components/ui/button'
import { AccessRequestStatus } from '@/enums/access-request-status.enum'
import { AccessRequests } from '@/interfaces/access-requests.interface'
import { useState } from 'react'
import { UpdateAccessRequestStatus } from './update-access-request-status'

interface RowOptionsProps {
  accessRequest: AccessRequests
}

export function AccessRequestRowOptions({ accessRequest }: RowOptionsProps) {
  const [isStatusModalOpen, setStatusModalIsOpen] = useState(false)

  const isPending = accessRequest.status === AccessRequestStatus.Pending

  return (
    <>
      {/* This row's only action is a decision (approve and bind the request to a customer), and
          DESIGN.md §4 wants decisions named in words — so it stays a labelled button rather than
          joining the icon-only row actions used by the CRUD screens. */}
      <Button variant={isPending ? 'default' : 'secondary'} size='sm' onClick={() => setStatusModalIsOpen(true)}>
        {isPending ? 'Revisar' : 'Alterar'}
      </Button>

      {isStatusModalOpen ? (
        <UpdateAccessRequestStatus
          accessRequest={accessRequest}
          open={isStatusModalOpen}
          onClose={() => setStatusModalIsOpen(false)}
        />
      ) : null}
    </>
  )
}
