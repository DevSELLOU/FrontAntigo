'use client'

import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import { StatusBadge } from '@/components/shared/status-badge'
import { CountryState } from '@/enums/country-state.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { useUrlSorting } from '@/hooks/use-url-sorting'
import { Customer } from '@/interfaces/customer.interface'
import { Segment } from '@/interfaces/segment.interface'
import { cn } from '@/lib/utils'
import { getCreditLimitUsage } from '@/utils/customers/credit-limit.util'
import { formatCpfCnpj } from '@/utils/format/format-cpf-cnpj.util'
import { formatPhoneNumber } from '@/utils/format/format-phone.util'
import { formatToShortNumber } from '@/utils/format/format-to-short-number.util'
import { getCustomerStatusText } from '@/utils/get-customer-status-text.util'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import { safeTableValue } from '@/utils/safe-table-value'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { DataTable } from '../../ui/data-table'
import { SortableColumnHeader } from '../../ui/sortable-column-header'
import { CustomerProfileSheet } from '../profile/customer-profile-sheet'
import { CustomerRowOptions } from './customer-row-options'

interface CustomersTableProps {
  customers: Customer[]
  segments: Segment[]
}

const VISIBILITY_STORAGE_KEY = 'customers-table-columns'

const DEFAULT_VISIBILITY: VisibilityState = {}

const TOGGLEABLE_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'corporateName', label: 'Razão Social' },
  { id: 'fantasyName', label: 'Nome Fantasia' },
  { id: 'document', label: 'CPF/CNPJ' },
  { id: 'city/state', label: 'Cidade/Estado' },
  { id: 'phoneNumber', label: 'Telefone' },
  { id: 'subSegmentId', label: 'Segmento' },
  { id: 'creditLimit', label: 'Limite de crédito' },
  { id: 'status', label: 'Status' },
  { id: 'updatedAt', label: 'Última atualização' }
]

const STATUS_VARIANT: Record<CustomerStatus, 'success' | 'neutral' | 'danger'> = {
  [CustomerStatus.Active]: 'success',
  [CustomerStatus.Inactive]: 'neutral',
  [CustomerStatus.Defaulting]: 'danger'
}

const TruncatedCell = ({ value }: { value: string }) => <div className='max-w-40 truncate'>{value}</div>

/** Same thresholds as `getCustomerCreditStatus`, matching the grid card's bar. */
function creditBarClass(percent: number): string {
  if (percent >= 90) return 'bg-danger-foreground'
  if (percent >= 70) return 'bg-warning-foreground'
  return 'bg-success-foreground'
}

export function CustomersTable({ customers, segments }: CustomersTableProps) {
  const { companyId } = useParams<{ companyId: string }>()
  const { sorting, handleSortingChange } = useUrlSorting()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(DEFAULT_VISIBILITY)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY)
    if (saved) {
      try {
        setColumnVisibility(JSON.parse(saved))
      } catch {
        // ignore malformed storage value
      }
    }
  }, [])

  const handleColumnVisibilityChange = (visibility: VisibilityState) => {
    setColumnVisibility(visibility)
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibility))
  }

  const toggleColumn = (id: string, visible: boolean) => {
    handleColumnVisibilityChange({ ...columnVisibility, [id]: visible })
  }

  const subSegmentsMap = useMemo(() => segments?.flatMap(({ subSegments }) => subSegments) || [], [segments])

  const getSubSegmentName = (subSegmentId: string | number | null | undefined): string => {
    if (!subSegmentId) return '-'
    return subSegmentsMap.find(({ id }) => id === Number(subSegmentId))?.name || '-'
  }

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <SortableColumnHeader column={column} label='ID' />,
      cell: ({ row }) => row.getValue<number>('id')?.toString().padStart(4, '0')
    },
    {
      accessorKey: 'corporateName',
      header: ({ column }) => <SortableColumnHeader column={column} label='Razão Social' />,
      cell: ({ row }) => <TruncatedCell value={safeTableValue(row.getValue('corporateName'))} />
    },
    {
      accessorKey: 'fantasyName',
      header: ({ column }) => <SortableColumnHeader column={column} label='Nome Fantasia' />,
      cell: ({ row }) => <TruncatedCell value={safeTableValue(row.getValue('fantasyName'))} />
    },
    {
      accessorKey: 'document',
      header: ({ column }) => <SortableColumnHeader column={column} label='CPF/CNPJ' />,
      cell: ({ row }) =>
        row.getValue('document') ? <TruncatedCell value={formatCpfCnpj(row.getValue('document'))} /> : '-'
    },
    {
      // Not sortable: this column is composed from two backend fields (city and UF), and `sort`
      // takes a single field name — a header that promised ordering here would not deliver it.
      id: 'city/state',
      enableSorting: false,
      header: 'Cidade/Estado',
      cell: ({ row }) => `${row.original.city}/${CountryState[row.original.UF as CountryState]}`
    },
    {
      accessorKey: 'phoneNumber',
      header: ({ column }) => <SortableColumnHeader column={column} label='Telefone' />,
      cell: ({ row }) => <TruncatedCell value={formatPhoneNumber(row.getValue('phoneNumber'))} />
    },
    {
      // Not sortable: the stored value is the sub-segment id, so the backend would order by a
      // number while the user reads names — alphabetically meaningless.
      accessorKey: 'subSegmentId',
      enableSorting: false,
      header: 'Segmento',
      cell: ({ row }) => <TruncatedCell value={getSubSegmentName(row.getValue('subSegmentId'))} />
    },
    {
      // Not sortable: this is a ratio of two columns, not a column.
      id: 'creditLimit',
      enableSorting: false,
      header: 'Limite de crédito',
      cell: ({ row }) => {
        const credit = getCreditLimitUsage(row.original)

        return (
          <div className='flex w-48 items-center gap-3'>
            <span className='w-9 text-right text-caption tabular-nums text-text-muted'>
              {Math.round(credit.percent)}%
            </span>
            <div className='h-2 w-20 overflow-hidden rounded-full bg-border'>
              <div
                className={cn('h-full rounded-full', creditBarClass(credit.percent))}
                style={{ width: `${credit.percent}%` }}
              />
            </div>
            <span className='w-16 text-caption tabular-nums text-text-muted'>
              {formatToShortNumber(credit.total)}
            </span>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <SortableColumnHeader column={column} label='Status' />,
      cell: ({ row }) => {
        const status = row.original.status ?? CustomerStatus.Active
        return (
          <StatusBadge variant={STATUS_VARIANT[status] ?? 'neutral'} className='font-semibold'>
            {getCustomerStatusText(status)}
          </StatusBadge>
        )
      }
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <SortableColumnHeader column={column} label='Última atualização' />,
      cell: ({ row }) => howTimeAgo(row.getValue('updatedAt'))
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => (
        <div className='flex justify-end'>
          <ColumnVisibilityToggle
            columns={TOGGLEABLE_COLUMNS}
            visibility={columnVisibility}
            onToggle={toggleColumn}
            onReset={() => handleColumnVisibilityChange(DEFAULT_VISIBILITY)}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1' onClick={event => event.stopPropagation()}>
          <CustomerRowOptions customer={row.original} companyId={companyId} onOpenDetails={setSelectedCustomer} />
        </div>
      )
    }
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={customers}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        onRowClick={setSelectedCustomer}
        emptyMessage='Nenhum cliente encontrado para o filtro selecionado.'
      />

      {selectedCustomer && (
        <CustomerProfileSheet
          customer={selectedCustomer}
          companyId={Number(companyId)}
          open={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </>
  )
}
