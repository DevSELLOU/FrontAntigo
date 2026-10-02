'use server'

import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { Segment } from '@/interfaces/segment.interface'
import { User } from '@/interfaces/user.interface'
import { handleServerAction } from '@/utils/server-action.util'

interface ReferenceDataResponse {
  segments: Segment[]
  paymentConditions: PaymentCondition[]
  paymentMethods: PaymentMethod[]
  /** Only populated when `includeUsers` is set — the customer form needs sellers, the sheet doesn't. */
  users: User[]
}

export async function fetchCustomerReferenceDataAction(
  companyId: number,
  options?: { includeUsers?: boolean }
): Promise<ReferenceDataResponse | { message: string; statusCode?: number }> {
  const baseUrl = `/company/${companyId}`
  const includeUsers = options?.includeUsers === true

  const [segmentsRes, conditionsRes, methodsRes, usersRes] = await Promise.all([
    handleServerAction<Segment[]>({ url: `${baseUrl}/segments`, method: 'GET' }),
    handleServerAction<PaymentCondition[]>({ url: `${baseUrl}/payment-condition`, method: 'GET' }),
    handleServerAction<PaymentMethod[]>({ url: `${baseUrl}/payment-method`, method: 'GET' }),
    includeUsers ? handleServerAction<User[]>({ url: `${baseUrl}/users`, method: 'GET' }) : Promise.resolve(null)
  ])

  if (
    !('data' in segmentsRes) ||
    !('data' in conditionsRes) ||
    !('data' in methodsRes) ||
    (includeUsers && !(usersRes && 'data' in usersRes))
  ) {
    return { message: 'Falha ao buscar dados de referência', statusCode: 500 }
  }

  return {
    segments: segmentsRes.data,
    paymentConditions: conditionsRes.data,
    paymentMethods: methodsRes.data,
    users: usersRes && 'data' in usersRes ? usersRes.data : []
  }
}
