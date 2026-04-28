import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { format } from 'date-fns'

import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import type { Media } from '@/payload-types'

import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import { Link } from '@/components/catalyst/link'
import { Heading, Subheading } from '@/components/catalyst/heading'
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from '@/components/catalyst/description-list'
import {
  CalendarIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/16/solid'
import type { Metadata } from 'next'

import { getTwDashParticipant } from '../data'
import { ParticipantDetailSkeleton } from './ParticipantDetailSkeleton'

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

function rel(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'name' in value) {
    return (value as { name: string }).name ?? null
  }
  return null
}

function mediaUrl(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'url' in value) {
    return (value as { url?: string | null }).url ?? null
  }
  return null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })
  if (!user) return {}
  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const participant = await getTwDashParticipant(id, userId)
  return { title: participant?.name }
}

async function ParticipantDetail({
  participantId,
  userId,
}: {
  participantId: string
  userId: number
}) {
  const participant = await getTwDashParticipant(participantId, userId)
  if (!participant) notFound()

  const eventName = rel(participant.event)
  const roleName = rel(participant.participantRole)
  const photoUrl = mediaUrl(participant.imageUrl)

  const hasCompany = !!(
    participant.companyName ||
    participant.companyPosition ||
    participant.companyWebsite
  )

  const hasPresentation = !!(
    participant.presentationTopic ||
    participant.presentationSummary ||
    participant.technicalRequirements
  )

  return (
    <>
      <div className="mt-4 lg:mt-8">
        <div className="flex flex-wrap items-start gap-6">
          {photoUrl && (
            <div className="shrink-0">
              <img
                className="size-20 rounded-full object-cover"
                src={photoUrl}
                alt={participant.name}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <Heading>{participant.name}</Heading>
              {participant.status && (
                <Badge color={STATUS_COLOR[participant.status] ?? 'zinc'}>
                  {STATUS_LABEL[participant.status] ?? participant.status}
                </Badge>
              )}
              {roleName && <Badge color="zinc">{roleName}</Badge>}
            </div>
            <div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
              <div className="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
                <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
                  <EnvelopeIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  <span>{participant.email}</span>
                </span>
                {participant.phoneNumber && (
                  <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
                    <PhoneIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                    <span>{participant.phoneNumber}</span>
                  </span>
                )}
                {participant.country && (
                  <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
                    <MapPinIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                    <span>{participant.country}</span>
                  </span>
                )}
                {participant.registrationDate && (
                  <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
                    <CalendarIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                    <span>{format(new Date(participant.registrationDate), 'PPP')}</span>
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                <Button outline href={`mailto:${participant.email}`}>
                  Email
                </Button>
                <Button href={`/admin/collections/participants/${participant.id}`}>Edit</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Subheading>Details</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>Email</DescriptionTerm>
          <DescriptionDetails>{participant.email}</DescriptionDetails>
          {participant.phoneNumber && (
            <>
              <DescriptionTerm>Phone</DescriptionTerm>
              <DescriptionDetails>{participant.phoneNumber}</DescriptionDetails>
            </>
          )}
          {participant.country && (
            <>
              <DescriptionTerm>Country</DescriptionTerm>
              <DescriptionDetails>{participant.country}</DescriptionDetails>
            </>
          )}
          {eventName && (
            <>
              <DescriptionTerm>Event</DescriptionTerm>
              <DescriptionDetails>{eventName}</DescriptionDetails>
            </>
          )}
          {participant.registrationDate && (
            <>
              <DescriptionTerm>Registered</DescriptionTerm>
              <DescriptionDetails>
                {format(new Date(participant.registrationDate), 'PPP')}
              </DescriptionDetails>
            </>
          )}
        </DescriptionList>
      </div>

      {participant.biography && (
        <div className="mt-12">
          <Subheading>Biography</Subheading>
          <Divider className="mt-4" />
          <p className="text-sm/6 text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap">
            {participant.biography}
          </p>
        </div>
      )}

      {hasCompany && (
        <div className="mt-12">
          <Subheading>Company</Subheading>
          <Divider className="mt-4" />
          <DescriptionList>
            {participant.companyName && (
              <>
                <DescriptionTerm>Name</DescriptionTerm>
                <DescriptionDetails>{participant.companyName}</DescriptionDetails>
              </>
            )}
            {participant.companyPosition && (
              <>
                <DescriptionTerm>Position</DescriptionTerm>
                <DescriptionDetails>{participant.companyPosition}</DescriptionDetails>
              </>
            )}
            {participant.companyWebsite && (
              <>
                <DescriptionTerm>Website</DescriptionTerm>
                <DescriptionDetails>
                  <a
                    href={participant.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline underline-offset-4"
                  >
                    {participant.companyWebsite}
                  </a>
                </DescriptionDetails>
              </>
            )}
          </DescriptionList>
        </div>
      )}

      {hasPresentation && (
        <div className="mt-12">
          <Subheading>Presentation</Subheading>
          <Divider className="mt-4" />
          <DescriptionList>
            {participant.presentationTopic && (
              <>
                <DescriptionTerm>Topic</DescriptionTerm>
                <DescriptionDetails>{participant.presentationTopic}</DescriptionDetails>
              </>
            )}
            {participant.presentationSummary && (
              <>
                <DescriptionTerm>Summary</DescriptionTerm>
                <DescriptionDetails className="whitespace-pre-wrap">
                  {participant.presentationSummary}
                </DescriptionDetails>
              </>
            )}
            {participant.technicalRequirements && (
              <>
                <DescriptionTerm>Tech requirements</DescriptionTerm>
                <DescriptionDetails>{participant.technicalRequirements}</DescriptionDetails>
              </>
            )}
          </DescriptionList>
        </div>
      )}

      {participant.socialLinks && participant.socialLinks.length > 0 && (
        <div className="mt-12">
          <Subheading>Social links</Subheading>
          <Divider className="mt-4" />
          <div className="mt-4 flex flex-wrap gap-2">
            {participant.socialLinks.map((link: any, i: number) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-zinc-950/10 px-3 py-1 text-xs/5 text-zinc-950 hover:bg-zinc-50 transition-colors capitalize dark:border-white/10 dark:text-white dark:hover:bg-zinc-800"
              >
                {link.platform}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default async function ParticipantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)
  if (organizationIds.length === 0) notFound()

  return (
    <>
      <div className="max-lg:hidden">
        <Link
          href="/tw/dash/participants"
          className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Participants
        </Link>
      </div>
      <Suspense fallback={<ParticipantDetailSkeleton />}>
        <ParticipantDetail participantId={id} userId={userId} />
      </Suspense>
    </>
  )
}
