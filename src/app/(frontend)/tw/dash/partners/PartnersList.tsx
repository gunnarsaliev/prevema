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
import type { Partner } from '@/payload-types'

const STATUS_COLOR: Record<string, 'zinc' | 'blue' | 'green' | 'red'> = {
  default: 'zinc',
  contacted: 'blue',
  confirmed: 'green',
  declined: 'red',
}

const STATUS_LABEL: Record<string, string> = {
  default: 'Default',
  contacted: 'Contacted',
  confirmed: 'Confirmed',
  declined: 'Declined',
}

function relationName(rel: unknown): string {
  if (!rel) return '—'
  if (typeof rel === 'object' && rel !== null && 'name' in rel) {
    return (rel as { name: string }).name ?? '—'
  }
  return '—'
}

export function PartnersList({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-base/6 font-semibold text-zinc-900 dark:text-white">No partners</p>
        <p className="text-sm/6 text-zinc-500 dark:text-zinc-400">
          Partners will appear here once they are added.
        </p>
      </div>
    )
  }

  return (
    <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
      <TableHead>
        <TableRow>
          <TableHeader>Company</TableHeader>
          <TableHeader>Contact</TableHeader>
          <TableHeader>Contact Email</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Event</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {partners.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">
              <Link href={`/tw/dash/partners/${p.id}`}>{p.companyName}</Link>
            </TableCell>
            <TableCell className="text-zinc-500 dark:text-zinc-400">{p.contactPerson}</TableCell>
            <TableCell className="text-zinc-500 dark:text-zinc-400">{p.contactEmail}</TableCell>
            <TableCell className="text-sm text-zinc-500 dark:text-zinc-400">
              {relationName(p.partnerType)}
            </TableCell>
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
              {relationName(p.event)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
