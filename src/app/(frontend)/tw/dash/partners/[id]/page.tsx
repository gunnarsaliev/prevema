import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

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
import { ChevronLeftIcon, EnvelopeIcon, GlobeAltIcon, UserIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'

import { getTwDashPartner } from '../data'
import { PartnerDetailSkeleton } from './PartnerDetailSkeleton'

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
    return (value as Media).url ?? null
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
  const partner = await getTwDashPartner(id, userId)
  return { title: partner?.companyName }
}

async function PartnerDetail({ partnerId, userId }: { partnerId: string; userId: number }) {
  const partner = await getTwDashPartner(partnerId, userId)
  if (!partner) notFound()

  const logoUrl = mediaUrl(partner.companyLogo) ?? partner.companyLogoUrl ?? null
  const eventName = rel(partner.event)
  const typeName = rel(partner.partnerType)
  const tierName = rel(partner.tier)

  return (
    <>
      <div className="mt-4 lg:mt-8">
        <div className="flex flex-wrap items-start gap-6">
          {logoUrl && (
            <div className="shrink-0">
              <img
                className="size-20 rounded-xl object-contain"
                src={logoUrl}
                alt={partner.companyName}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <Heading>{partner.companyName}</Heading>
              {partner.status && (
                <Badge color={STATUS_COLOR[partner.status] ?? 'zinc'}>
                  {STATUS_LABEL[partner.status] ?? partner.status}
                </Badge>
              )}
              {typeName && <Badge color="zinc">{typeName}</Badge>}
              {tierName && <Badge color="zinc">{tierName}</Badge>}
            </div>
            <div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
              <div className="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
                {partner.contactPerson && (
                  <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
                    <UserIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                    <span>{partner.contactPerson}</span>
                  </span>
                )}
                {partner.contactEmail && (
                  <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
                    <EnvelopeIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                    <span>{partner.contactEmail}</span>
                  </span>
                )}
                {partner.companyWebsiteUrl && (
                  <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
                    <GlobeAltIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                    <a
                      href={partner.companyWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline underline-offset-4"
                    >
                      {partner.companyWebsiteUrl}
                    </a>
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                {partner.contactEmail && (
                  <Button outline href={`mailto:${partner.contactEmail}`}>
                    Email
                  </Button>
                )}
                <Button href={`/admin/collections/partners/${partner.id}`}>Edit</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Subheading>Details</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>Contact</DescriptionTerm>
          <DescriptionDetails>{partner.contactPerson}</DescriptionDetails>
          <DescriptionTerm>Contact email</DescriptionTerm>
          <DescriptionDetails>{partner.contactEmail}</DescriptionDetails>
          {partner.fieldOfExpertise && (
            <>
              <DescriptionTerm>Field</DescriptionTerm>
              <DescriptionDetails>{partner.fieldOfExpertise}</DescriptionDetails>
            </>
          )}
          {eventName && (
            <>
              <DescriptionTerm>Event</DescriptionTerm>
              <DescriptionDetails>{eventName}</DescriptionDetails>
            </>
          )}
          {partner.sponsorshipLevel && (
            <>
              <DescriptionTerm>Sponsorship</DescriptionTerm>
              <DescriptionDetails>{partner.sponsorshipLevel}</DescriptionDetails>
            </>
          )}
        </DescriptionList>
      </div>

      {partner.companyDescription && (
        <div className="mt-12">
          <Subheading>About</Subheading>
          <Divider className="mt-4" />
          <p className="text-sm/6 text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap">
            {partner.companyDescription}
          </p>
        </div>
      )}

      {partner.additionalNotes && (
        <div className="mt-12">
          <Subheading>Notes</Subheading>
          <Divider className="mt-4" />
          <p className="text-sm/6 text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap">
            {partner.additionalNotes}
          </p>
        </div>
      )}

      {partner.socialLinks && partner.socialLinks.length > 0 && (
        <div className="mt-12">
          <Subheading>Social links</Subheading>
          <Divider className="mt-4" />
          <div className="mt-4 flex flex-wrap gap-2">
            {partner.socialLinks.map((link: any, i: number) => (
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

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
          href="/tw/dash/partners"
          className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Partners
        </Link>
      </div>
      <Suspense fallback={<PartnerDetailSkeleton />}>
        <PartnerDetail partnerId={id} userId={userId} />
      </Suspense>
    </>
  )
}
