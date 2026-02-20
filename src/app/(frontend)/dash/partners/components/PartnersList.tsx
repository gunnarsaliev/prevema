'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Pencil, Trash2, Loader2, MoreHorizontal } from 'lucide-react'

import type { Partner } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createSelectColumn, BulkAction } from '@/components/ui/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { EntityList, EntityListConfig } from '@/components/shared/EntityList'
import {
  handleEntityDelete,
  handleEntityBulkDelete,
  getRelationName,
} from '@/lib/entity-actions'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  default: 'secondary',
  contacted: 'default',
  confirmed: 'default',
  declined: 'destructive',
}

interface EventOption {
  id: number
  name: string
}

interface Props {
  partners: Partner[]
  events: EventOption[]
  eventId?: string
}

export function PartnersList({ partners, events, eventId }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const handleEventChange = (value: string) => {
    if (value === 'all') {
      router.push('/dash/partners')
    } else {
      router.push(`/dash/partners?eventId=${value}`)
    }
  }

  const handleDelete = async (id: number, companyName: string) => {
    await handleEntityDelete(
      { id, companyName } as any,
      {
        apiEndpoint: '/api/partners',
        entityName: 'partner',
        getEntityName: (entity) => entity.companyName,
      },
      {
        onStart: () => setDeletingId(id),
        onSuccess: () => {
          router.refresh()
          setDeletingId(null)
        },
        onError: () => setDeletingId(null),
      }
    )
  }

  const handleBulkDelete = async (rows: Row<Partner>[]) => {
    await handleEntityBulkDelete(
      rows,
      {
        apiEndpoint: '/api/partners',
        entityName: 'partner',
      },
      {
        onStart: () => setBulkDeleting(true),
        onSuccess: () => {
          router.refresh()
          setBulkDeleting(false)
        },
        onError: () => setBulkDeleting(false),
      }
    )
  }

  const bulkActions: BulkAction<Partner>[] = [
    {
      label: 'Delete',
      icon: bulkDeleting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="mr-2 h-4 w-4" />
      ),
      variant: 'destructive',
      onClick: handleBulkDelete,
      confirmation: {
        title: 'Delete partners',
        description: (count) =>
          `Are you sure you want to delete ${count} partner${count > 1 ? 's' : ''}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    },
  ]

  const columns: ColumnDef<Partner>[] = [
    createSelectColumn<Partner>(),
    {
      accessorKey: 'companyName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('companyName')}</div>,
    },
    {
      accessorKey: 'partnerType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Partner type" />
      ),
      cell: ({ row }) => getRelationName(row.getValue('partnerType')),
      enableSorting: false,
    },
    {
      accessorKey: 'tier',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tier" />,
      cell: ({ row }) => getRelationName(row.getValue('tier')),
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant={STATUS_VARIANT[status ?? 'default']}>
            {status ?? 'default'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'contactPerson',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const partner = row.original
        const isDeleting = deletingId === partner.id

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/dash/partners/${partner.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isDeleting}
                  onClick={() => handleDelete(partner.id, partner.companyName)}
                  className="text-destructive focus:text-destructive"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const createHref = eventId
    ? `/dash/partners/create?eventId=${eventId}`
    : '/dash/partners/create'

  const config: EntityListConfig<Partner> = {
    title: 'Partners',
    createButtonLabel: 'New partner',
    createHref,
    columns,
    data: partners,
    searchKey: 'companyName',
    searchPlaceholder: 'Search partners...',
    emptyTitle: 'No partners yet',
    emptyDescription: eventId
      ? 'No partners found for this event.'
      : 'Add your first partner to get started.',
    emptyActionLabel: 'Add partner',
    bulkActions,
    filter: {
      label: 'Filter by event',
      value: eventId ?? 'all',
      options: [
        { value: 'all', label: 'All events' },
        ...events.map((e) => ({ value: String(e.id), label: e.name })),
      ],
      onChange: handleEventChange,
    },
  }

  return <EntityList config={config} />
}
