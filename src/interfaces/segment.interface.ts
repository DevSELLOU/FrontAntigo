import { SubSegment } from './sub-segment.interface'

export interface Segment {
  id: number
  name: string
  description: string
  companyId: number
  createdAt: Date
  updatedAt: Date
  subSegments: SubSegment[]
}
