'use client'

import { Badge } from '@/components/catalyst/badge'
import { Link } from '@/components/catalyst/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
import type { Participant } from '@/payload-types'

const STATUS_COLOR: Record<string, 'green' | 'zinc' | 'red' | 'yellow'> = {
  approved: 'green',
  'not-approved': 'zinc',
  cancelled: 'red',
  'need-info': 'yellow',
}

const STATUS_LABEL: Record<string, string> = {
  approved: 'Approved',
  'not-approved': 'Not Approved',
  cancelled: 'Cancelled',
  'need-info': 'Need Info',
}

function relationName(rel: unknown): string {
  if (!rel) return '—'
  if (typeof rel === 'object' && rel !== null && 'name' in rel) {
    return (rel as { name: string }).name ?? '—'
  }
  return '—'
}

export function ParticipantsList({ participants }: { participants: Participant[] }) {
  if (participants.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-base/6 font-semibold text-zinc-900 dark:text-white">No participants</p>
        <p className="text-sm/6 text-zinc-500 dark:text-zinc-400">
          Participants will appear here once they register.
        </p>
      </div>
    )
  }

  return (
    <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Role</TableHeader>
          <TableHeader>Event</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {participants.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">
              <Link href={`/tw/dash/participants/${p.id}`}>{p.name}</Link>
            </TableCell>
            <TableCell className="text-zinc-500 dark:text-zinc-400">{p.email}</TableCell>
            <TableCell>
              {p.status ? (
                <Badge color={STATUS_COLOR[p.status] ?? 'zinc'}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </Badge>
              ) : (
                <span className="text-zinc-400">—</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-zinc-500 dark:text-zinc-400">
              {relationName(p.participantRole)}
            </TableCell>
            <TableCell className="text-sm text-zinc-500 dark:text-zinc-400">
              {relationName(p.event)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
