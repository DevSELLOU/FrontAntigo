import { SubSegmentSchema } from '@/schemas/sub-segment.schema'
import { z } from 'zod'

export type SubSegmentDto = z.infer<typeof SubSegmentSchema>
