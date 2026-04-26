import Link from 'next/link'
import { Users } from 'lucide-react'

import type { Participant } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  approved: 'default',
  'not-approved': 'secondary',
  cancelled: 'destructive',
  'need-info': 'outline',
}

function statusLabel(status: string | null | undefined) {
  if (!status) return '—'
  const map: Record<string, string> = {
    approved: 'Approved',
    'not-approved': 'Not Approved',
    cancelled: 'Cancelled',
    'need-info': 'Need Info',
  }
  return map[status] ?? status
}

function relationName(rel: unknown): string {
  if (!rel) return '—'
  if (typeof rel === 'object' && rel !== null && 'name' in rel) {
    return (rel as { name: string }).name ?? '—'
  }
  return '—'
}

interface Props {
  participants: Participant[]
  canEdit: boolean
}

export function ParticipantsTable({ participants, canEdit }: Props) {
  if (participants.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center">
          <Users className="size-10 text-muted-foreground" aria-hidden />
          <h3 className="text-lg font-semibold">No participants yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {canEdit
              ? 'Participants will appear here once they register.'
              : 'No participants have registered yet.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Event</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dash/participants/${p.id}`}
                  className="hover:underline underline-offset-4"
                >
                  {p.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{p.email}</TableCell>
              <TableCell>
                {p.status ? (
                  <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'}>
                    {statusLabel(p.status)}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {relationName(p.participantRole)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {relationName(p.event)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
