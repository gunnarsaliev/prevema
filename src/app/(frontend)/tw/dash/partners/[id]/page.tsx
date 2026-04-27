import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import Image from 'next/image'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import type { Media } from '@/payload-types'

import { Badge } from '@/components/catalyst/badge'
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

import { getTwDashPartner } from '../data'

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

export default async function PartnerDetailPage({
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

  const partner = await getTwDashPartner(id, userId)
  if (!partner) notFound()

  const logoUrl = mediaUrl(partner.companyLogo) ?? partner.companyLogoUrl ?? null
  const eventName = rel(partner.event)
  const typeName = rel(partner.partnerType)
  const tierName = rel(partner.tier)

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div className="max-lg:hidden">
        <Link
          href="/tw/dash/partners"
          className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Partners
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Logo */}
        <div className="md:col-span-1">
          {logoUrl ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={logoUrl}
                alt={partner.companyName}
                fill
                priority
                className="object-contain p-4"
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
                  d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Core info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {partner.status && (
              <Badge color={STATUS_COLOR[partner.status] ?? 'zinc'}>
                {STATUS_LABEL[partner.status] ?? partner.status}
              </Badge>
            )}
            {typeName && <Badge color="zinc">{typeName}</Badge>}
            {tierName && <Badge color="zinc">{tierName}</Badge>}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {partner.companyName}
          </h1>

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

          {partner.companyWebsiteUrl && (
            <a
              href={partner.companyWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm/6 text-zinc-500 hover:underline underline-offset-4 dark:text-zinc-400"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
              {partner.companyWebsiteUrl}
            </a>
          )}
        </div>
      </div>

      {partner.companyDescription && (
        <>
          <Divider />
          <p className="text-sm/6 text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap">
            {partner.companyDescription}
          </p>
        </>
      )}

      {partner.additionalNotes && (
        <>
          <Divider />
          <div>
            <Subheading>Notes</Subheading>
            <p className="mt-4 text-sm/6 text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap">
              {partner.additionalNotes}
            </p>
          </div>
        </>
      )}

      {partner.socialLinks && partner.socialLinks.length > 0 && (
        <>
          <Divider />
          <div>
            <Subheading>Social links</Subheading>
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
        </>
      )}
    </div>
  )
}
