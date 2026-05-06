'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { MoreHorizontal } from 'lucide-react'
import type { Participant, Media } from '@/payload-types'
import type { QuickViewItem } from '../components/QuickViewDrawer'
import { EnvelopeIcon, PhoneIcon, GlobeAltIcon, CalendarIcon } from '@heroicons/react/16/solid'

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

export function participantToItem(p: Participant): QuickViewItem {
  const imageUrl =
    p.imageUrl && typeof p.imageUrl === 'object' ? ((p.imageUrl as Media).url ?? null) : null
  const roleName = relationName(p.participantRole)
  const eventName = relationName(p.event)

  const badges: NonNullable<QuickViewItem['badges']> = []
  if (p.status)
    badges.push({
      label: STATUS_LABEL[p.status] ?? p.status,
      color: STATUS_COLOR[p.status] ?? 'zinc',
    })
  if (roleName !== '—') badges.push({ label: roleName, color: 'zinc' })

  const fields: QuickViewItem['fields'] = [
    { icon: <EnvelopeIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />, text: p.email },
  ]
  if (p.phoneNumber)
    fields.push({
      icon: <PhoneIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.phoneNumber,
    })
  if (p.country)
    fields.push({
      icon: <GlobeAltIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.country,
    })
  if (eventName !== '—')
    fields.push({
      icon: <CalendarIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: eventName,
    })

  const sections: QuickViewItem['sections'] = []
  if (p.biography) sections.push({ title: 'Bio', content: p.biography })
  if (p.companyName) {
    const detail = [p.companyName, p.companyPosition].filter(Boolean).join(' · ')
    sections.push({ title: 'Company', content: detail })
  }

  return {
    id: p.id,
    title: p.name,
    imageUrl,
    badges,
    fields,
    sections,
    detailHref: `/tw/dash/participants/${p.id}`,
  }
}

export function makeColumns(onQuickView: (item: QuickViewItem) => void): ColumnDef<Participant>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
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
              <div className="size-8 flex-none overflow-hidden rounded-full">
                <img
                  src={imageUrl}
                  alt=""
                  className="aspect-square h-full w-full object-cover bg-gray-50 dark:bg-gray-800"
                />
              </div>
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      accessorFn: (row) => relationName(row.participantRole),
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{getValue() as string}</span>
      ),
    },
    {
      id: 'event',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Event" />,
      accessorFn: (row) => relationName(row.event),
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status
        if (!status) return <span className="text-gray-400">—</span>
        return (
          <Badge color={STATUS_COLOR[status] ?? 'zinc'}>{STATUS_LABEL[status] ?? status}</Badge>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Registered" />,
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
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const p = row.original
        return (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onQuickView(participantToItem(p))}
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Quick view</span>
          </Button>
        )
      },
    },
  ]
}
