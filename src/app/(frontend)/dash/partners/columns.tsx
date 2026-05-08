'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { MoreHorizontal } from 'lucide-react'
import type { Partner, Media } from '@/payload-types'
import type { QuickViewItem } from '../components/QuickViewDrawer'
import {
  UserIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  CalendarIcon,
} from '@heroicons/react/16/solid'

const STATUS_COLOR: Record<string, 'zinc' | 'blue' | 'green' | 'red'> = {
  default: 'zinc',
  contacted: 'blue',
  confirmed: 'green',
  declined: 'red',
}

const STATUS_LABEL: Record<string, string> = {
  default: 'Default',
  contacted: 'Contacted',
  confirmed: 'Confirmed',
  declined: 'Declined',
}

function relationName(rel: unknown): string {
  if (!rel) return '—'
  if (typeof rel === 'object' && rel !== null && 'name' in rel) {
    return (rel as { name: string }).name ?? '—'
  }
  return '—'
}

function mediaUrl(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'url' in value) {
    return (value as Media).url ?? null
  }
  return null
}

export function partnerToItem(p: Partner): QuickViewItem {
  const logoUrl = mediaUrl(p.companyLogo) ?? p.companyLogoUrl ?? null
  const typeName = relationName(p.partnerType)
  const tierName = relationName(p.tier)
  const eventName = relationName(p.event)

  const badges: NonNullable<QuickViewItem['badges']> = []
  if (p.status)
    badges.push({
      label: STATUS_LABEL[p.status] ?? p.status,
      color: STATUS_COLOR[p.status] ?? 'zinc',
    })
  if (typeName !== '—') badges.push({ label: typeName, color: 'zinc' })
  if (tierName !== '—') badges.push({ label: tierName, color: 'zinc' })

  const fields: QuickViewItem['fields'] = []
  if (p.contactPerson)
    fields.push({
      icon: <UserIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.contactPerson,
    })
  if (p.contactEmail)
    fields.push({
      icon: <EnvelopeIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.contactEmail,
    })
  if (p.fieldOfExpertise)
    fields.push({
      icon: <BuildingOffice2Icon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.fieldOfExpertise,
    })
  if (p.companyWebsiteUrl)
    fields.push({
      icon: <GlobeAltIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.companyWebsiteUrl,
    })
  if (eventName !== '—')
    fields.push({
      icon: <CalendarIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: eventName,
    })

  const sections: QuickViewItem['sections'] = []
  if (p.companyDescription) sections.push({ title: 'About', content: p.companyDescription })

  return {
    id: p.id,
    title: p.companyName,
    imageUrl: logoUrl,
    badges,
    fields,
    sections,
    detailHref: `/dash/partners/${p.id}`,
  }
}

export function makeColumns(onQuickView: (item: QuickViewItem) => void): ColumnDef<Partner>[] {
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
      accessorKey: 'companyName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
      cell: ({ row }) => {
        const p = row.original
        const logoUrl = mediaUrl(p.companyLogo) ?? p.companyLogoUrl ?? null
        return (
          <a
            href={`/dash/partners/${p.id}`}
            className="flex items-center gap-3 hover:underline"
          >
            {logoUrl ? (
              <div className="size-8 flex-none overflow-hidden rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt=""
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
            ) : (
              <span className="flex size-8 flex-none items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {p.companyName?.charAt(0).toUpperCase() ?? '?'}
              </span>
            )}
            <span className="font-medium text-gray-900 dark:text-white">{p.companyName}</span>
          </a>
        )
      },
    },
    {
      accessorKey: 'contactPerson',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.original.contactPerson}
        </span>
      ),
    },
    {
      accessorKey: 'contactEmail',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <a
          href={`mailto:${row.original.contactEmail}`}
          className="text-sm text-gray-500 hover:underline dark:text-gray-400"
        >
          {row.original.contactEmail}
        </a>
      ),
    },
    {
      id: 'partnerType',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      accessorFn: (row) => relationName(row.partnerType),
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => {
        const date = row.original.createdAt
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
            onClick={() => onQuickView(partnerToItem(p))}
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Quick view</span>
          </Button>
        )
      },
    },
  ]
}
