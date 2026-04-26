import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import { ArrowLeft, Building2, Globe, Mail, Phone, Handshake } from 'lucide-react'

import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import type { Media } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { getDashboardPartner } from '../data'
import { PartnerDetailSkeleton } from './components/PartnerDetailSkeleton'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  contacted: 'default',
  confirmed: 'default',
  declined: 'destructive',
  default: 'secondary',
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

interface DetailProps {
  partnerId: string
  userId: number
}

async function PartnerDetail({ partnerId, userId }: DetailProps) {
  const partner = await getDashboardPartner(partnerId, userId)
  if (!partner) notFound()

  const logoUrl = mediaUrl(partner.companyLogo) ?? partner.companyLogoUrl ?? null
  const eventName = rel(partner.event)
  const typeName = rel(partner.partnerType)
  const tierName = rel(partner.tier)

  return (
    <article className="mx-auto max-w-3xl space-y-8 pb-16">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/dashboard/partners">
          <ArrowLeft className="size-4" />
          All partners
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Logo */}
        <div className="md:col-span-1">
          {logoUrl ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
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
            <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-muted">
              <Building2 className="size-16 text-muted-foreground/30" aria-hidden />
            </div>
          )}
        </div>

        {/* Core info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {partner.status && (
              <Badge variant={STATUS_VARIANT[partner.status] ?? 'secondary'} className="capitalize">
                {partner.status}
              </Badge>
            )}
            {typeName && <Badge variant="outline">{typeName}</Badge>}
            {tierName && <Badge variant="outline">{tierName}</Badge>}
          </div>

          <h1 className="text-3xl font-bold tracking-tight">{partner.companyName}</h1>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
            {partner.contactPerson && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Handshake className="size-4 shrink-0" aria-hidden />
                <span>{partner.contactPerson}</span>
              </div>
            )}
            {partner.contactEmail && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" aria-hidden />
                <span>{partner.contactEmail}</span>
              </div>
            )}
            {partner.fieldOfExpertise && (
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <span>{partner.fieldOfExpertise}</span>
              </div>
            )}
            {eventName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">Event · {eventName}</span>
              </div>
            )}
            {partner.sponsorshipLevel && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">Sponsorship · {partner.sponsorshipLevel}</span>
              </div>
            )}
          </dl>

          {partner.companyWebsiteUrl && (
            <a
              href={partner.companyWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-4"
            >
              <Globe className="size-3.5" aria-hidden />
              {partner.companyWebsiteUrl}
            </a>
          )}
        </div>
      </div>

      {partner.companyDescription && (
        <>
          <Separator />
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {partner.companyDescription}
          </p>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {partner.additionalNotes && (
          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{partner.additionalNotes}</p>
            </CardContent>
          </Card>
        )}

        {partner.socialLinks && partner.socialLinks.length > 0 && (
          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Social links
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {partner.socialLinks.map((link: any, i: number) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border px-3 py-1 text-xs hover:bg-muted transition-colors capitalize"
                >
                  {link.platform}
                </a>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </article>
  )
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

  const rawOrgIds = await getUserOrganizationIds(payload, user)
  if (rawOrgIds.length === 0) notFound()

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-8 md:px-8">
        <Suspense fallback={<PartnerDetailSkeleton />}>
          <PartnerDetail partnerId={id} userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}
