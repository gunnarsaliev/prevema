'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react'

import type { Participant } from '@/payload-types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

  const handleEventChange = (value: string) => {
    if (value === 'all') {
      router.push('/dash/participants')
    } else {
      router.push(`/dash/participants?eventId=${value}`)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/participants/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.refresh()
    } catch {
      alert('Failed to delete participant.')
    } finally {
      setDeletingId(null)
    }
  }

  const getRelationName = (rel: unknown): string => {
    if (!rel) return '—'
    if (typeof rel === 'object' && rel !== null && 'name' in rel)
      return (rel as { name: string }).name
    return '—'
  }

  const createHref = eventId
    ? `/dash/participants/create?eventId=${eventId}`
    : '/dash/participants/create'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Participants</h1>
        <Button asChild>
          <Link href={createHref}>
            <Plus className="mr-2 h-4 w-4" />
            New participant
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

      {participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <p className="text-lg font-medium">No participants yet</p>
          <p className="text-sm mt-1">
            {eventId
              ? 'No participants found for this event.'
              : 'Add your first participant to get started.'}
          </p>
          <Button asChild className="mt-4">
            <Link href={createHref}>Add participant</Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Participant type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-medium">{participant.name}</TableCell>
                <TableCell>{getRelationName(participant.participantType)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[participant.status ?? 'not-approved']}>
                    {STATUS_LABEL[participant.status ?? 'not-approved']}
                  </Badge>
                </TableCell>
                <TableCell>{participant.email}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dash/participants/${participant.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === participant.id}
                      onClick={() => handleDelete(participant.id, participant.name)}
                    >
                      {deletingId === participant.id ? (
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
