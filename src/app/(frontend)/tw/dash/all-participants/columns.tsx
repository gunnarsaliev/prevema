'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/catalyst/badge'
import type { Participant, Media } from '@/payload-types'

const STATUS_COLOR: Record<string, 'green' | 'zinc' | 'red' | 'yellow'> = {
  approved: 'green',
  'not-approved': 'zinc',
  cancelled: 'red',
  'need-info': 'yellow',
}

const STATUS_LABEL: Record<string, string> = {
  approved: 'Approved',
  'not-approved': 'Not Approved',
  cancelled: 'Cancelled',
  'need-info': 'Need Info',
}

function relationName(rel: unknown): string {
  if (!rel) return '—'
  if (typeof rel === 'object' && rel !== null && 'name' in rel) {
    return (rel as { name: string }).name ?? '—'
  }
  return '—'
}

export const columns: ColumnDef<Participant>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const p = row.original
      const imageUrl =
        p.imageUrl && typeof p.imageUrl === 'object' ? ((p.imageUrl as Media).url ?? null) : null
      return (
        <a
          href={`/tw/dash/participants/${p.id}`}
          className="flex items-center gap-3 hover:underline"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="size-8 flex-none rounded-full object-cover bg-gray-50 dark:bg-gray-800"
            />
          ) : (
            <span className="flex size-8 flex-none items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {p.name?.charAt(0).toUpperCase() ?? '?'}
            </span>
          )}
          <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
        </a>
      )
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <a
        href={`mailto:${row.original.email}`}
        className="text-sm text-gray-500 hover:underline dark:text-gray-400"
      >
        {row.original.email}
      </a>
    ),
  },
  {
    id: 'participantRole',
    header: 'Role',
    accessorFn: (row) => relationName(row.participantRole),
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{getValue() as string}</span>
    ),
  },
  {
    id: 'event',
    header: 'Event',
    accessorFn: (row) => relationName(row.event),
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-500 dark:text-gray-400">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      if (!status) return <span className="text-gray-400">—</span>
      return <Badge color={STATUS_COLOR[status] ?? 'zinc'}>{STATUS_LABEL[status] ?? status}</Badge>
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Registered',
    cell: ({ row }) => {
      const date = row.original.registrationDate ?? row.original.createdAt
      if (!date) return <span className="text-gray-400">—</span>
      return (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(date).toLocaleDateString()}
        </span>
      )
    },
  },
]
