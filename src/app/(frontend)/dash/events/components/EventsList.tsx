'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2, Eye, Plus, Loader2, MoreHorizontal } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  planning: 'secondary',
  open: 'default',
  closed: 'outline',
  archived: 'destructive',
}

interface Props {
  events: Event[]
}

export function EventsList({ events }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.refresh()
    } catch {
      alert('Failed to delete event.')
    } finally {
      setDeletingId(null)
    }
  }

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'eventType',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => {
        const type = row.getValue('eventType') as string
        return <span className="capitalize">{type ?? '—'}</span>
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant={STATUS_VARIANT[status ?? 'planning']}>
            {status ?? 'planning'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Start date" />,
      cell: ({ row }) => {
        const date = row.getValue('startDate') as string
        return date ? format(new Date(date), 'dd MMM yyyy, HH:mm') : '—'
      },
    },
    {
      accessorKey: 'endDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title="End date" />,
      cell: ({ row }) => {
        const date = row.getValue('endDate') as string
        return date ? format(new Date(date), 'dd MMM yyyy, HH:mm') : '—'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const event = row.original
        const isDeleting = deletingId === event.id

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
                  <Link href={`/dash/events/${event.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dash/events/${event.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isDeleting}
                  onClick={() => handleDelete(event.id, event.name)}
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Events</h1>
        <Button asChild>
          <Link href="/dash/events/create">
            <Plus className="mr-2 h-4 w-4" />
            New event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <p className="text-lg font-medium">No events yet</p>
          <p className="text-sm mt-1">Create your first event to get started.</p>
          <Button asChild className="mt-4">
            <Link href="/dash/events/create">Create event</Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={events}
          searchKey="name"
          searchPlaceholder="Search events..."
        />
      )}
    </div>
  )
}
