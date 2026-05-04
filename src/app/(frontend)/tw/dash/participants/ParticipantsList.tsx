'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/components/catalyst/alert'
import { EnvelopeIcon, PhoneIcon, GlobeAltIcon, CalendarIcon } from '@heroicons/react/16/solid'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import type { Participant, Media } from '@/payload-types'
import { QuickViewDrawer } from '../components/QuickViewDrawer'
import type { QuickViewItem } from '../components/QuickViewDrawer'
import { deleteParticipant } from './create/actions'

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

function participantToItem(p: Participant, eventId?: string): QuickViewItem {
  const baseHref = eventId
    ? `/tw/dash/events/${eventId}/participants/${p.id}`
    : `/tw/dash/participants/${p.id}`
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
    detailHref: baseHref,
  }
}

export function ParticipantsList({
  participants,
  eventId,
}: {
  participants: Participant[]
  eventId?: string
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<QuickViewItem | null>(null)
  const [toDelete, setToDelete] = useState<Participant | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    const result = await deleteParticipant(String(toDelete.id))
    setDeleting(false)
    if (result.success) {
      setToDelete(null)
      router.refresh()
    }
  }

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
      <ul role="list" className="mt-8 divide-y divide-gray-100 dark:divide-white/5">
        {participants.map((p) => {
          const imageUrl =
            p.imageUrl && typeof p.imageUrl === 'object'
              ? ((p.imageUrl as Media).url ?? null)
              : null
          const roleName = relationName(p.participantRole)
          const detailHref = eventId
            ? `/tw/dash/events/${eventId}/participants/${p.id}`
            : `/tw/dash/participants/${p.id}`
          return (
            <li
              key={p.id}
              className="relative flex justify-between gap-x-6 py-5 hover:bg-gray-50 dark:hover:bg-white/2.5"
            >
              <div className="flex min-w-0 gap-x-4">
                {imageUrl ? (
                  <img
                    alt=""
                    src={imageUrl}
                    className="size-12 flex-none rounded-full object-cover bg-gray-50 dark:bg-gray-800 dark:outline dark:-outline-offset-1 dark:outline-white/10"
                  />
                ) : (
                  <span className="flex size-12 flex-none items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {p.name?.charAt(0).toUpperCase() ?? '?'}
                  </span>
                )}
                <div className="min-w-0 flex-auto">
                  <p className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                    <button
                      type="button"
                      onClick={() => setSelected(participantToItem(p, eventId))}
                      className="focus:outline-none"
                    >
                      <span className="absolute inset-x-0 -top-px bottom-0" />
                      {p.name}
                    </button>
                  </p>
                  <p className="mt-1 flex text-xs/5 text-gray-500 dark:text-gray-400">
                    <a href={`mailto:${p.email}`} className="relative truncate hover:underline">
                      {p.email}
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-4">
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  {roleName !== '—' && (
                    <p className="text-sm/6 text-gray-900 dark:text-white">{roleName}</p>
                  )}
                  {p.status && (
                    <div className="mt-1">
                      <Badge color={STATUS_COLOR[p.status] ?? 'zinc'}>{p.status}</Badge>
                    </div>
                  )}
                </div>
                <ChevronRightIcon
                  aria-hidden="true"
                  className="size-5 flex-none text-gray-400 dark:text-gray-500"
                />
              </div>
            </li>
          )
        })}
      </ul>

      <QuickViewDrawer item={selected} onClose={() => setSelected(null)} />

      <Alert open={toDelete !== null} onClose={() => setToDelete(null)}>
        <AlertTitle>Delete participant?</AlertTitle>
        <AlertDescription>This action cannot be undone.</AlertDescription>
        <AlertActions>
          <Button plain onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete participant'}
          </Button>
        </AlertActions>
      </Alert>
    </>
  )
}
