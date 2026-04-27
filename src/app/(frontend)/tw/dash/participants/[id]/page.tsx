import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import Image from 'next/image'
import { getPayload } from 'payload'
import { format } from 'date-fns'

import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import type { Media } from '@/payload-types'

import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import { Link } from '@/components/catalyst/link'
import { Subheading } from '@/components/catalyst/heading'
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from '@/components/catalyst/description-list'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'

import { getTwDashParticipant } from '../data'

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

  const participant = await getTwDashParticipant(id, userId)
  if (!participant) notFound()

  const imageUrl =
    participant.imageUrl && typeof participant.imageUrl === 'object'
      ? (participant.imageUrl as Media).url ?? null
      : null

  const eventName = rel(participant.event)
  const roleName = rel(participant.participantRole)

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
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div className="max-lg:hidden">
        <Link
          href="/tw/dash/participants"
          className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Participants
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Avatar */}
        <div className="md:col-span-1">
          {imageUrl ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={imageUrl}
                alt={participant.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <svg
                className="size-16 text-zinc-300 dark:text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Core info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {participant.status && (
              <Badge color={STATUS_COLOR[participant.status] ?? 'zinc'}>
                {STATUS_LABEL[participant.status] ?? participant.status}
              </Badge>
            )}
            {roleName && <Badge color="zinc">{roleName}</Badge>}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {participant.name}
          </h1>

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
      </div>

      {participant.biography && (
        <>
          <Divider />
          <p className="text-sm/6 text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap">
            {participant.biography}
          </p>
        </>
      )}

      {hasCompany && (
        <>
          <Divider />
          <div>
            <Subheading>Company</Subheading>
            <DescriptionList className="mt-4">
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
        </>
      )}

      {hasPresentation && (
        <>
          <Divider />
          <div>
            <Subheading>Presentation</Subheading>
            <DescriptionList className="mt-4">
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
        </>
      )}

      {participant.socialLinks && participant.socialLinks.length > 0 && (
        <>
          <Divider />
          <div>
            <Subheading>Social links</Subheading>
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
        </>
      )}
    </div>
  )
}
