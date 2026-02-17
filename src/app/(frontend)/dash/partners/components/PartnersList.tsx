'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react'

import type { Partner } from '@/payload-types'
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Partner type</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((partner) => (
              <TableRow key={partner.id}>
                <TableCell className="font-medium">{partner.companyName}</TableCell>
                <TableCell>{getRelationName(partner.partnerType)}</TableCell>
                <TableCell>{getRelationName(partner.tier)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[partner.status ?? 'default']}>
                    {partner.status ?? 'default'}
                  </Badge>
                </TableCell>
                <TableCell>{partner.contactPerson}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dash/partners/${partner.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === partner.id}
                      onClick={() => handleDelete(partner.id, partner.companyName)}
                    >
                      {deletingId === partner.id ? (
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
