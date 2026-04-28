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
import {
  UserIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  CalendarIcon,
} from '@heroicons/react/16/solid'
import type { Partner, Media } from '@/payload-types'
import { QuickViewDrawer } from '../components/QuickViewDrawer'
import type { QuickViewItem } from '../components/QuickViewDrawer'

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

function mediaUrl(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'url' in value) {
    return (value as Media).url ?? null
  }
  return null
}

function partnerToItem(p: Partner): QuickViewItem {
  const logoUrl = mediaUrl(p.companyLogo) ?? p.companyLogoUrl ?? null

  const typeName = relationName(p.partnerType)
  const tierName = relationName(p.tier)
  const eventName = relationName(p.event)

  const badges: NonNullable<QuickViewItem['badges']> = []
  if (p.status)
    badges.push({
      label: STATUS_LABEL[p.status] ?? p.status,
      color: STATUS_COLOR[p.status] ?? 'zinc',
    })
  if (typeName !== '—') badges.push({ label: typeName, color: 'zinc' })
  if (tierName !== '—') badges.push({ label: tierName, color: 'zinc' })

  const fields: QuickViewItem['fields'] = []
  if (p.contactPerson)
    fields.push({
      icon: <UserIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.contactPerson,
    })
  if (p.contactEmail)
    fields.push({
      icon: <EnvelopeIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.contactEmail,
    })
  if (p.fieldOfExpertise)
    fields.push({
      icon: <BuildingOffice2Icon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.fieldOfExpertise,
    })
  if (eventName !== '—')
    fields.push({
      icon: <CalendarIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: eventName,
    })

  const sections: QuickViewItem['sections'] = []
  if (p.companyDescription) sections.push({ title: 'About', content: p.companyDescription })

  return {
    id: p.id,
    title: p.companyName,
    imageUrl: logoUrl,
    badges,
    fields,
    sections,
    detailHref: `/tw/dash/partners/${p.id}`,
  }
}

export function PartnersList({ partners }: { partners: Partner[] }) {
  const [selected, setSelected] = useState<QuickViewItem | null>(null)

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
    <>
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
                <button
                  type="button"
                  onClick={() => setSelected(partnerToItem(p))}
                  className="text-left hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded"
                >
                  {p.companyName}
                </button>
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

      <QuickViewDrawer item={selected} onClose={() => setSelected(null)} />
    </>
  )
}
