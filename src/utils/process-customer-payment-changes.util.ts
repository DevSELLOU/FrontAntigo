import { CustomError } from '@/errors/custom-error.error'
import { isApiErrorResponse } from './is-api-error-response.util'

type ProcessCustomerPaymentChangesProps = {
  currentIds: number[] | undefined
  newIds: number[] | undefined
  addAction: (id: number) => Promise<any>
  removeAction: (id: number) => Promise<any>
}

export const processCustomerPaymentChanges = async ({
  currentIds,
  newIds,
  addAction,
  removeAction
}: ProcessCustomerPaymentChangesProps) => {
  const addedIds = newIds?.filter(id => !currentIds?.includes(id))
  const removedIds = currentIds?.filter(id => !newIds?.includes(id))

  if (removedIds && removedIds?.length > 0) {
    for (const id of removedIds) {
      const response = await removeAction(id)
      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }
    }
  }

  if (addedIds && addedIds?.length > 0) {
    for (const id of addedIds) {
      const response = await addAction(id)
      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }
    }
  }
}
