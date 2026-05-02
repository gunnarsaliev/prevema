import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import { Heading, Subheading } from '@/components/catalyst/heading'
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from '@/components/catalyst/description-list'
import { CalendarIcon, MapPinIcon } from '@heroicons/react/16/solid'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarGroup, AvatarMore } from '@/components/shadcnblocks/avatar-group'
import type { Media } from '@/payload-types'

import { getTwDashEvent } from '../data'
import { getTwDashParticipants } from '../../participants/data'
import { getTwDashPartners } from '../../partners/data'

const STATUS_COLOR: Record<string, 'zinc' | 'lime' | 'red' | 'blue'> = {
  planning: 'zinc',
  open: 'lime',
  closed: 'red',
  archived: 'zinc',
}

const STATUS_LABEL: Record<string, string> = {
  planning: 'Planning',
  open: 'On Sale',
  closed: 'Closed',
  archived: 'Archived',
}

const MAX_AVATARS = 5

export async function EventDetail({
  eventId,
  userId,
  organizationIds,
}: {
  eventId: string
  userId: number
  organizationIds: number[]
}) {
  const event = await getTwDashEvent(eventId, userId)
  if (!event) notFound()

  const [participants, partners] = await Promise.all([
    getTwDashParticipants(userId, organizationIds, eventId),
    getTwDashPartners(userId, organizationIds, eventId),
  ])

  const imgUrl =
    event.image && typeof event.image === 'object' && 'url' in event.image
      ? ((event.image as Media).url ?? null)
      : null

  const startDate = event.startDate ? format(new Date(event.startDate), 'PPP') : null
  const endDate = event.endDate ? format(new Date(event.endDate), 'PPP') : null
  const location = event.where || event.address || null

  return (
    <>
      <div className="mt-4 lg:mt-8">
        <div className="flex flex-wrap items-start gap-6">
          {imgUrl && (
            <div className="shrink-0">
              <img className="size-20 rounded-xl object-cover" src={imgUrl} alt={event.name} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <Heading>{event.name}</Heading>
              {event.status && (
                <Badge color={STATUS_COLOR[event.status] ?? 'zinc'}>
                  {STATUS_LABEL[event.status] ?? event.status}
                </Badge>
              )}
              {event.eventType && (
                <Badge color="zinc" className="capitalize">
                  {event.eventType}
                </Badge>
              )}
            </div>
            <div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
              <div className="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
                {startDate && (
                  <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
                    <CalendarIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                    <span>
                      {startDate}
                      {endDate && ` – ${endDate}`}
                      {event.timezone && ` (${event.timezone})`}
                    </span>
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
                    <MapPinIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                    <span>{location}</span>
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                <Button outline href={`/tw/dash/events/${eventId}/edit`}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Subheading>Details</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          {event.description && (
            <>
              <DescriptionTerm>Description</DescriptionTerm>
              <DescriptionDetails className="whitespace-pre-wrap">
                {event.description}
              </DescriptionDetails>
            </>
          )}
          {event.theme && (
            <>
              <DescriptionTerm>Theme</DescriptionTerm>
              <DescriptionDetails>{event.theme}</DescriptionDetails>
            </>
          )}
          {event.why && (
            <>
              <DescriptionTerm>Why</DescriptionTerm>
              <DescriptionDetails className="whitespace-pre-wrap">{event.why}</DescriptionDetails>
            </>
          )}
          {event.what && (
            <>
              <DescriptionTerm>What</DescriptionTerm>
              <DescriptionDetails className="whitespace-pre-wrap">{event.what}</DescriptionDetails>
            </>
          )}
          {event.who && (
            <>
              <DescriptionTerm>Who</DescriptionTerm>
              <DescriptionDetails className="whitespace-pre-wrap">{event.who}</DescriptionDetails>
            </>
          )}
          {event.address && (
            <>
              <DescriptionTerm>Address</DescriptionTerm>
              <DescriptionDetails>{event.address}</DescriptionDetails>
            </>
          )}
          <DescriptionTerm>Participants</DescriptionTerm>
          <DescriptionDetails>
            <div className="flex flex-wrap items-center gap-3">
              <AvatarGroup spacing="tight">
                {participants.slice(0, MAX_AVATARS).map((p) => {
                  const imgUrl =
                    p.imageUrl && typeof p.imageUrl === 'object' && 'url' in p.imageUrl
                      ? ((p.imageUrl as Media).url ?? undefined)
                      : undefined
                  const initials = p.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                  return (
                    <Avatar key={p.id} className="size-8 ring-2 ring-background">
                      <AvatarImage src={imgUrl} alt={p.name} className="object-cover" />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  )
                })}
                {participants.length > MAX_AVATARS && (
                  <AvatarMore count={participants.length - MAX_AVATARS} size={32} />
                )}
              </AvatarGroup>
              <a
                href={`/tw/dash/events/${eventId}/participants`}
                className="text-sm text-zinc-500 hover:text-zinc-900 hover:underline underline-offset-4 dark:hover:text-white"
              >
                View all
              </a>
            </div>
          </DescriptionDetails>
          <DescriptionTerm>Partners</DescriptionTerm>
          <DescriptionDetails>
            <div className="flex flex-wrap items-center gap-3">
              <AvatarGroup spacing="tight">
                {partners.slice(0, MAX_AVATARS).map((p) => {
                  const logoUrl =
                    p.companyLogo && typeof p.companyLogo === 'object' && 'url' in p.companyLogo
                      ? ((p.companyLogo as Media).url ?? undefined)
                      : (p.companyLogoUrl ?? undefined)
                  const initials = p.companyName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                  return (
                    <Avatar key={p.id} className="size-8 ring-2 ring-background">
                      <AvatarImage src={logoUrl} alt={p.companyName} className="object-contain p-1" />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  )
                })}
                {partners.length > MAX_AVATARS && (
                  <AvatarMore count={partners.length - MAX_AVATARS} size={32} />
                )}
              </AvatarGroup>
              <a
                href={`/tw/dash/events/${eventId}/partners`}
                className="text-sm text-zinc-500 hover:text-zinc-900 hover:underline underline-offset-4 dark:hover:text-white"
              >
                View all
              </a>
            </div>
          </DescriptionDetails>
        </DescriptionList>
      </div>
    </>
  )
}
