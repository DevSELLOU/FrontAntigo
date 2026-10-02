import { RequestShopAccessSchema } from '@/schemas/request-shop-access.schema'
import { z } from 'zod'

export type RequestShopAccessDto = z.infer<typeof RequestShopAccessSchema>
