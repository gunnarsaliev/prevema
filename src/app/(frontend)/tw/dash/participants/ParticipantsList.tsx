'use client'

import { useState } from 'react'
import { Badge } from '@/components/catalyst/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
import { EnvelopeIcon, PhoneIcon, GlobeAltIcon, CalendarIcon } from '@heroicons/react/16/solid'
import type { Participant, Media } from '@/payload-types'
import { QuickViewDrawer } from '../components/QuickViewDrawer'
import type { QuickViewItem } from '../components/QuickViewDrawer'

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

function participantToItem(p: Participant): QuickViewItem {
  const imageUrl =
    p.imageUrl && typeof p.imageUrl === 'object' ? ((p.imageUrl as Media).url ?? null) : null

  const roleName = relationName(p.participantRole)
  const eventName = relationName(p.event)

  const badges: NonNullable<QuickViewItem['badges']> = []
  if (p.status)
    badges.push({
      label: STATUS_LABEL[p.status] ?? p.status,
      color: STATUS_COLOR[p.status] ?? 'zinc',
    })
  if (roleName !== '—') badges.push({ label: roleName, color: 'zinc' })

  const fields: QuickViewItem['fields'] = [
    { icon: <EnvelopeIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />, text: p.email },
  ]
  if (p.phoneNumber)
    fields.push({
      icon: <PhoneIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.phoneNumber,
    })
  if (p.country)
    fields.push({
      icon: <GlobeAltIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.country,
    })
  if (eventName !== '—')
    fields.push({
      icon: <CalendarIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: eventName,
    })

  const sections: QuickViewItem['sections'] = []
  if (p.biography) sections.push({ title: 'Bio', content: p.biography })
  if (p.companyName) {
    const detail = [p.companyName, p.companyPosition].filter(Boolean).join(' · ')
    sections.push({ title: 'Company', content: detail })
  }

  return {
    id: p.id,
    title: p.name,
    imageUrl,
    badges,
    fields,
    sections,
    detailHref: `/tw/dash/participants/${p.id}`,
  }
}

export function ParticipantsList({ participants }: { participants: Participant[] }) {
  const [selected, setSelected] = useState<QuickViewItem | null>(null)

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
    <>
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
                <button
                  type="button"
                  onClick={() => setSelected(participantToItem(p))}
                  className="text-left hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded"
                >
                  {p.name}
                </button>
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

      <QuickViewDrawer item={selected} onClose={() => setSelected(null)} />
    </>
  )
}
