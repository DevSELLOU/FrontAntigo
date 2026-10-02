import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { SubCategory } from '@/interfaces/sub-category-interface'
import { SubSegment } from '@/interfaces/sub-segment.interface'

export function getSubItemsCount(array: SubCategory[] | SubSegment[] | PaymentCondition[], maxDisplayed: number = 2) {
  const displayedItems = array?.slice(0, maxDisplayed)
  const remainingCount = array?.length - displayedItems?.length

  const names = displayedItems?.map((item: SubCategory | SubSegment | PaymentCondition) => item.name).join(', ')

  return {
    names,
    remainingCount
  }
}
