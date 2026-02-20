'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2, Plus, Loader2, MoreHorizontal } from 'lucide-react'

import type { Partner } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'

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

  const handleEventChange = (value: string) => {
    if (value === 'all') {
      router.push('/dash/partners')
    } else {
      router.push(`/dash/partners?eventId=${value}`)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.refresh()
    } catch {
      alert('Failed to delete partner.')
    } finally {
      setDeletingId(null)
    }
  }

  const getRelationName = (rel: unknown): string => {
    if (!rel) return '—'
    if (typeof rel === 'object' && rel !== null && 'name' in rel) return (rel as { name: string }).name
    return '—'
  }

  const createHref = eventId
    ? `/dash/partners/create?eventId=${eventId}`
    : '/dash/partners/create'

  const columns: ColumnDef<Partner>[] = [
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Partners</h1>
        <Button asChild>
          <Link href={createHref}>
            <Plus className="mr-2 h-4 w-4" />
            New partner
          </Link>
        </Button>
      </div>

      {/* Event filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter by event</span>
        <Select value={eventId ?? 'all'} onValueChange={handleEventChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            {events.map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {partners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <p className="text-lg font-medium">No partners yet</p>
          <p className="text-sm mt-1">
            {eventId
              ? 'No partners found for this event.'
              : 'Add your first partner to get started.'}
          </p>
          <Button asChild className="mt-4">
            <Link href={createHref}>Add partner</Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={partners}
          searchKey="companyName"
          searchPlaceholder="Search partners..."
        />
      )}
    </div>
  )
}
