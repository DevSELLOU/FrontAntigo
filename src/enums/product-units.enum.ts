export const DimensionUnit = {
  Millimeter: 'mm',
  Centimeter: 'cm',
  Meter: 'm',
} as const

export const WeightUnit = {
  Gram: 'g',
  Kilogram: 'kg',
} as const

export type DimensionUnit = typeof DimensionUnit[keyof typeof DimensionUnit]
export type WeightUnit = typeof WeightUnit[keyof typeof WeightUnit]