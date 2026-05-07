'use client'

import { useState } from 'react'
import { EnvelopeIcon, EyeIcon } from '@heroicons/react/20/solid'
import {
  EnvelopeIcon as EnvelopeIconSmall,
  PhoneIcon,
  GlobeAltIcon,
  CalendarIcon,
} from '@heroicons/react/16/solid'
import type { Participant, Media, ParticipantRole } from '@/payload-types'
import { QuickViewDrawer, type QuickViewItem } from '../../../components/QuickViewDrawer'

const STATUS_COLOR: Record<string, string> = {
  approved:
    'bg-green-50 text-green-700 inset-ring-green-600/20 dark:bg-green-500/10 dark:text-green-500 dark:inset-ring-green-500/10',
  'not-approved':
    'bg-zinc-50 text-zinc-700 inset-ring-zinc-600/20 dark:bg-zinc-500/10 dark:text-zinc-400 dark:inset-ring-zinc-500/10',
  cancelled:
    'bg-red-50 text-red-700 inset-ring-red-600/20 dark:bg-red-500/10 dark:text-red-500 dark:inset-ring-red-500/10',
  'need-info':
    'bg-yellow-50 text-yellow-700 inset-ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-500 dark:inset-ring-yellow-500/10',
}

const STATUS_LABEL: Record<string, string> = {
  approved: 'Approved',
  'not-approved': 'Not Approved',
  cancelled: 'Cancelled',
  'need-info': 'Need Info',
}

function getImageUrl(imageUrl: unknown): string | null {
  if (!imageUrl) return null
  if (typeof imageUrl === 'object' && imageUrl !== null && 'url' in imageUrl) {
    return (imageUrl as Media).url ?? null
  }
  return null
}

function getRoleName(role: unknown): string | null {
  if (!role) return null
  if (typeof role === 'object' && role !== null && 'name' in role) {
    return (role as ParticipantRole).name ?? null
  }
  return null
}

function relationName(rel: unknown): string {
  if (!rel) return '—'
  if (typeof rel === 'object' && rel !== null && 'name' in rel) {
    return (rel as { name: string }).name ?? '—'
  }
  return '—'
}

const STATUS_COLOR_BADGE: Record<string, 'green' | 'zinc' | 'red' | 'yellow'> = {
  approved: 'green',
  'not-approved': 'zinc',
  cancelled: 'red',
  'need-info': 'yellow',
}

function participantToItem(p: Participant, eventId?: string): QuickViewItem {
  const baseHref = eventId
    ? `/dash/events/${eventId}/participants/${p.id}`
    : `/dash/participants/${p.id}`
  const imageUrl =
    p.imageUrl && typeof p.imageUrl === 'object' ? ((p.imageUrl as Media).url ?? null) : null

  const roleName = relationName(p.participantRole)
  const eventName = relationName(p.event)

  const badges: NonNullable<QuickViewItem['badges']> = []
  if (p.status)
    badges.push({
      label: STATUS_LABEL[p.status] ?? p.status,
      color: STATUS_COLOR_BADGE[p.status] ?? 'zinc',
    })
  if (roleName !== '—') badges.push({ label: roleName, color: 'zinc' })

  const fields: QuickViewItem['fields'] = [
    {
      icon: <EnvelopeIconSmall className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: p.email,
    },
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

interface ParticipantsGridProps {
  participants: Participant[]
  eventId?: string
}

export default function ParticipantsGrid({ participants, eventId }: ParticipantsGridProps) {
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
      <ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {participants.map((person) => {
          const imageUrl = getImageUrl(person.imageUrl)
          const roleName = getRoleName(person.participantRole)
          const status = person.status
          const title = person.companyPosition
          const detailHref = eventId
            ? `/dash/events/${eventId}/participants/${person.id}`
            : `/dash/participants/${person.id}`

          return (
            <li
              key={person.id}
              className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10"
            >
              <div className="flex flex-1 flex-col p-8">
                {imageUrl ? (
                  <img
                    alt=""
                    src={imageUrl}
                    className="mx-auto size-32 shrink-0 rounded-full bg-gray-300 object-cover aspect-square outline -outline-offset-1 outline-black/5 dark:bg-gray-700 dark:outline-white/10"
                  />
                ) : (
                  <span className="mx-auto flex size-32 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-2xl font-medium text-zinc-500 outline -outline-offset-1 outline-black/5 dark:bg-zinc-800 dark:text-zinc-400 dark:outline-white/10">
                    {person.name?.charAt(0).toUpperCase() ?? '?'}
                  </span>
                )}
                <h3 className="mt-6 text-sm font-medium text-gray-900 dark:text-white">
                  <a href={detailHref} className="hover:underline focus:outline-none">
                    {person.name}
                  </a>
                </h3>
                <dl className="mt-1 flex grow flex-col justify-between">
                  <dt className="sr-only">Title</dt>
                  <dd className="text-sm text-gray-500 dark:text-gray-400">
                    {title || roleName || '—'}
                  </dd>
                  <dt className="sr-only">Status</dt>
                  <dd className="mt-3">
                    {status && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium inset-ring ${STATUS_COLOR[status]}`}
                      >
                        {STATUS_LABEL[status] ?? status}
                      </span>
                    )}
                  </dd>
                </dl>
              </div>
              <div>
                <div className="-mt-px flex divide-x divide-gray-200 dark:divide-white/10">
                  <div className="flex w-0 flex-1">
                    <a
                      href={`mailto:${person.email}`}
                      className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                    >
                      <EnvelopeIcon
                        aria-hidden="true"
                        className="size-5 text-gray-400 dark:text-gray-500"
                      />
                      Email
                    </a>
                  </div>
                  <div className="-ml-px flex w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setSelected(participantToItem(person, eventId))}
                      className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                    >
                      <EyeIcon
                        aria-hidden="true"
                        className="size-5 text-gray-400 dark:text-gray-500"
                      />
                      View
                    </button>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <QuickViewDrawer item={selected} onClose={() => setSelected(null)} />
    </>
  )
}
