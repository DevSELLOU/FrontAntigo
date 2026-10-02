import { CustomError } from '@/errors/custom-error.error'
import { isApiErrorResponse } from './is-api-error-response.util'

type AddCustomerPaymentItemsProps = {
  items: number[] | undefined
  addAction: (id: number) => Promise<any>
}

export const addCustomerPaymentItems = async ({ items, addAction }: AddCustomerPaymentItemsProps) => {
  if (items && items?.length > 0) {
    for (const itemId of items) {
      const itemResponse = await addAction(itemId)
      if (isApiErrorResponse(itemResponse)) {
        throw new CustomError(itemResponse.message)
      }
    }
  }
}
