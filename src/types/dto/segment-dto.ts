import { SegmentSchema } from '@/schemas/segment.schema'
import { z } from 'zod'

export type SegmentDto = z.infer<typeof SegmentSchema>
