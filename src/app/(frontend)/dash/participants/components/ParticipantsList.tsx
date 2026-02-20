'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Pencil, Trash2, Loader2, MoreHorizontal } from 'lucide-react'

import type { Participant } from '@/payload-types'
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

const STATUS_LABEL: Record<string, string> = {
  'not-approved': 'Not Approved',
  approved: 'Approved',
  'need-info': 'Need Info',
  cancelled: 'Cancelled',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'not-approved': 'secondary',
  approved: 'default',
  'need-info': 'outline',
  cancelled: 'destructive',
}

interface EventOption {
  id: number
  name: string
}

interface Props {
  participants: Participant[]
  events: EventOption[]
  eventId?: string
}

export function ParticipantsList({ participants, events, eventId }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const handleEventChange = (value: string) => {
    if (value === 'all') {
      router.push('/dash/participants')
    } else {
      router.push(`/dash/participants?eventId=${value}`)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    await handleEntityDelete(
      { id, name } as any,
      {
        apiEndpoint: '/api/participants',
        entityName: 'participant',
        getEntityName: (entity) => entity.name,
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

  const handleBulkDelete = async (rows: Row<Participant>[]) => {
    await handleEntityBulkDelete(
      rows,
      {
        apiEndpoint: '/api/participants',
        entityName: 'participant',
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

  const bulkActions: BulkAction<Participant>[] = [
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
        title: 'Delete participants',
        description: (count) =>
          `Are you sure you want to delete ${count} participant${count > 1 ? 's' : ''}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    },
  ]

  const columns: ColumnDef<Participant>[] = [
    createSelectColumn<Participant>(),
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'participantType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Participant type" />
      ),
      cell: ({ row }) => getRelationName(row.getValue('participantType')),
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant={STATUS_VARIANT[status ?? 'not-approved']}>
            {STATUS_LABEL[status ?? 'not-approved']}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const participant = row.original
        const isDeleting = deletingId === participant.id

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
                  <Link href={`/dash/participants/${participant.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isDeleting}
                  onClick={() => handleDelete(participant.id, participant.name)}
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
    ? `/dash/participants/create?eventId=${eventId}`
    : '/dash/participants/create'

  const config: EntityListConfig<Participant> = {
    title: 'Participants',
    createButtonLabel: 'New participant',
    createHref,
    columns,
    data: participants,
    searchKey: 'name',
    searchPlaceholder: 'Search participants...',
    emptyTitle: 'No participants yet',
    emptyDescription: eventId
      ? 'No participants found for this event.'
      : 'Add your first participant to get started.',
    emptyActionLabel: 'Add participant',
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
