import { notFound } from 'next/navigation'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import { Heading, Subheading } from '@/components/catalyst/heading'
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from '@/components/catalyst/description-list'
import { EnvelopeIcon, GlobeAltIcon, BuildingOfficeIcon, PhoneIcon } from '@heroicons/react/16/solid'
import { EmailHistorySection } from '@/components/EmailHistorySection'
import type { Media, Event } from '@/payload-types'

import { getTwDashParticipant } from '../data'

const STATUS_COLOR: Record<string, 'zinc' | 'blue' | 'green' | 'red' | 'amber'> = {
  approved: 'green',
  'not-approved': 'zinc',
  'need-info': 'amber',
  cancelled: 'red',
}

const STATUS_LABEL: Record<string, string> = {
  approved: 'Approved',
  'not-approved': 'Not Approved',
  'need-info': 'Needs Info',
  cancelled: 'Cancelled',
}

function mediaUrl(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'url' in value) {
    return (value as Media).url ?? null
  }
  return null
}

function relName(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'name' in value) {
    return (value as { name: string }).name ?? null
  }
  return null
}

export async function ParticipantDetail({
  participantId,
  userId,
}: {
  participantId: string
  userId: number
}) {
  const participant = await getTwDashParticipant(participantId, userId)
  if (!participant) notFound()

  const avatarUrl = mediaUrl(participant.imageUrl)
  const eventName = relName(participant.event)
  const roleName = relName(participant.participantRole)

  return (
    <>
      <div className="mt-4 lg:mt-8">
        <div className="flex flex-wrap items-start gap-6">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={participant.name}
              className="size-20 rounded-xl object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <Heading>{participant.name}</Heading>
              {participant.status && (
                <Badge color={STATUS_COLOR[participant.status] ?? 'zinc'}>
                  {STATUS_LABEL[participant.status] ?? participant.status}
                </Badge>
              )}
              {roleName && <Badge color="zinc">{roleName}</Badge>}
            </div>

            <div className="mt-2.5 flex flex-wrap gap-x-8 gap-y-3 py-1.5">
              {participant.email && (
                <span className="flex items-center gap-2 text-sm/6 text-zinc-950 dark:text-white">
                  <EnvelopeIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  {participant.email}
                </span>
              )}
              {participant.phoneNumber && (
                <span className="flex items-center gap-2 text-sm/6 text-zinc-950 dark:text-white">
                  <PhoneIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  {participant.phoneNumber}
                </span>
              )}
              {participant.companyName && (
                <span className="flex items-center gap-2 text-sm/6 text-zinc-950 dark:text-white">
                  <BuildingOfficeIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  {participant.companyName}
                  {participant.companyPosition ? ` · ${participant.companyPosition}` : ''}
                </span>
              )}
              {participant.companyWebsite && (
                <span className="flex items-center gap-2 text-sm/6 text-zinc-950 dark:text-white">
                  <GlobeAltIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  <a
                    href={participant.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline underline-offset-4"
                  >
                    {participant.companyWebsite}
                  </a>
                </span>
              )}
            </div>

            <div className="mt-3 flex gap-3">
              {participant.email && (
                <Button outline href={`mailto:${participant.email}`}>
                  Email
                </Button>
              )}
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
                {new Date(participant.registrationDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </DescriptionDetails>
            </>
          )}

          {participant.presentationTopic && (
            <>
              <DescriptionTerm>Presentation</DescriptionTerm>
              <DescriptionDetails>{participant.presentationTopic}</DescriptionDetails>
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

      {participant.email && (
        <div className="mt-12">
          <EmailHistorySection recipientEmail={participant.email} />
        </div>
      )}
    </>
  )
}
