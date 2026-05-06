'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { useState } from 'react'
import { MoreHorizontal, Copy, Check, ExternalLink } from 'lucide-react'
import type { ParticipantRole } from '@/payload-types'
import type { QuickViewItem } from '../components/QuickViewDrawer'
import { LinkIcon, TagIcon } from '@heroicons/react/16/solid'

function CopyLinkCell({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
    >
      {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
      {copied ? 'Copied!' : 'Copy link'}
    </Button>
  )
}

export function participantRoleToItem(role: ParticipantRole): QuickViewItem {
  const fields: NonNullable<QuickViewItem['fields']> = []

  if (role.requiredFields && role.requiredFields.length > 0) {
    fields.push({
      icon: <TagIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: `${role.requiredFields.length} required field${role.requiredFields.length !== 1 ? 's' : ''}`,
    })
  }

  if (role.publicFormLink) {
    fields.push({
      icon: <LinkIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: role.publicFormLink,
    })
  }

  const sections: NonNullable<QuickViewItem['sections']> = []
  if (role.description) sections.push({ title: 'Description', content: role.description })

  return {
    id: role.id,
    title: role.name,
    badges: [
      { label: role.isActive ? 'Active' : 'Inactive', color: role.isActive ? 'green' : 'zinc' },
    ],
    fields,
    sections,
    detailHref: `/dash/participant-roles/${role.id}`,
  }
}

export function makeColumns(
  onQuickView: (item: QuickViewItem) => void,
): ColumnDef<ParticipantRole>[] {
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
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-white">{row.getValue('name')}</span>
      ),
    },
    {
      accessorKey: 'requiredFields',
      header: 'Required fields',
      enableSorting: false,
      cell: ({ row }) => {
        const fields = row.getValue('requiredFields') as string[] | null
        return Array.isArray(fields) && fields.length > 0 ? (
          <Badge color="zinc">{fields.length} fields</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">None</span>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean
        return <Badge color={isActive ? 'green' : 'zinc'}>{isActive ? 'Active' : 'Inactive'}</Badge>
      },
    },
    {
      id: 'publicFormLink',
      header: 'Form link',
      enableSorting: false,
      cell: ({ row }) => {
        const url = row.original.publicFormLink
        return url ? (
          <CopyLinkCell url={url} />
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      },
    },
    {
      id: 'formLinkOpen',
      header: 'Form',
      enableSorting: false,
      cell: ({ row }) => {
        const url = row.original.publicFormLink
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ExternalLink className="size-3" />
            Open
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const role = row.original
        return (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onQuickView(participantRoleToItem(role))}
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Quick view</span>
          </Button>
        )
      },
    },
  ]
}
