'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Pencil, Trash2, Eye, Plus, Loader2 } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start date</TableHead>
              <TableHead>End date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell className="capitalize">{event.eventType ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[event.status ?? 'planning']}>
                    {event.status ?? 'planning'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {event.startDate ? format(new Date(event.startDate), 'dd MMM yyyy, HH:mm') : '—'}
                </TableCell>
                <TableCell>
                  {event.endDate ? format(new Date(event.endDate), 'dd MMM yyyy, HH:mm') : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dash/events/${event.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dash/events/${event.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === event.id}
                      onClick={() => handleDelete(event.id, event.name)}
                    >
                      {deletingId === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
