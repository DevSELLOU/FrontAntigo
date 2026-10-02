import { Segment } from './segment.interface'

export interface SubSegment {
  id: number
  name: string
  segmentId: number
  createdAt: Date
  updatedAt: Date
  segment: Segment
}
