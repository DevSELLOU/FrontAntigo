import type { ColumnDef } from '@tanstack/react-table'
import { enumToOptions, getEnumForField } from './enum-mapping'

type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean'

export interface FieldTypeMapping {
  [key: string]: {
    type: FieldType
    label: string
    options?: { value: string; label: string }[]
  }
}

export interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'number' | 'boolean'
  options?: { value: string; label: string }[]
}

export interface FilterCondition {
  field: string
  operator: string
  value: string
  sort?: 'asc' | 'desc' | null
}

export function tableToFilterFields(columns: ColumnDef<any>[], tableName?: string): FilterField[] {
  return columns
    .filter((column: any) => column.accessorKey && column.id !== 'actions')
    .map((column: any) => {
      const key = column.accessorKey

      const field: FilterField = {
        key,
        label: column.header as string,
        type: 'text'
      }

      const enumType = getEnumForField(key, tableName)
      if (enumType) {
        field.type = 'select'
        field.options = enumToOptions(enumType)
      }

      if (key.toLowerCase().includes('date') || key.endsWith('At')) {
        field.type = 'date'
      }

      return field
    })
}

export function apiToFilterFields<T extends Record<string, any>>({
  data,
  fieldMappings = {},
  enumReference,
  excludeFields = []
}: {
  data: T
  fieldMappings: FieldTypeMapping
  enumReference?: string
  excludeFields: string[]
}): FilterField[] {
  if (!data || Object.keys(data).length === 0) {
    return Object.entries(fieldMappings).map(([key, mapping]) => ({
      key,
      label: mapping.label,
      type: mapping.type,
      options: mapping.options || (enumReference ? enumToOptions(getEnumForField(key, enumReference) || {}) : undefined)
    }))
  }

  return Object.entries(data)
    .filter(([key]) => !excludeFields.includes(key))
    .map(([key, value]) => {
      const enumType = getEnumForField(key, enumReference)
      if (enumType) {
        return {
          key,
          label: fieldMappings[key]?.label || formatFieldLabel(key),
          type: 'select',
          options: enumToOptions(enumType)
        }
      }

      if (fieldMappings[key]) {
        return {
          key,
          label: fieldMappings[key].label,
          type: fieldMappings[key].type,
          options: fieldMappings[key].options
        }
      }

      let type: FieldType = 'text'
      if (value instanceof Date || key.toLowerCase().includes('date') || key.endsWith('At')) {
        type = 'date'
      } else if (typeof value === 'number') {
        type = 'number'
      } else if (typeof value === 'boolean') {
        type = 'boolean'
      }

      return {
        key,
        label: formatFieldLabel(key),
        type
      }
    })
}

function formatFieldLabel(key: string): string {
  return key
    .split(/(?=[A-Z])|_/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
