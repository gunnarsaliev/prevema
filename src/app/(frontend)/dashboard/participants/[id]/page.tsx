import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import { ArrowLeft, User, Mail, Phone, Globe, MapPin, Briefcase, Calendar } from 'lucide-react'
import { format } from 'date-fns'

import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import type { Media } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { getDashboardParticipant } from '../data'
import { ParticipantDetailSkeleton } from './components/ParticipantDetailSkeleton'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  approved: 'default',
  'not-approved': 'secondary',
  cancelled: 'destructive',
  'need-info': 'outline',
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

interface DetailProps {
  participantId: string
  userId: number
}

async function ParticipantDetail({ participantId, userId }: DetailProps) {
  const participant = await getDashboardParticipant(participantId, userId)
  if (!participant) notFound()

  const imageUrl =
    participant.imageUrl && typeof participant.imageUrl === 'object'
      ? (participant.imageUrl as Media).url
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
    <article className="mx-auto max-w-3xl space-y-8 pb-16">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/dashboard/participants">
          <ArrowLeft className="size-4" />
          All participants
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Avatar */}
        <div className="md:col-span-1">
          {imageUrl ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
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
            <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-muted">
              <User className="size-16 text-muted-foreground/30" aria-hidden />
            </div>
          )}
        </div>

        {/* Core info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {participant.status && (
              <Badge variant={STATUS_VARIANT[participant.status] ?? 'secondary'}>
                {STATUS_LABEL[participant.status] ?? participant.status}
              </Badge>
            )}
            {roleName && <Badge variant="outline">{roleName}</Badge>}
          </div>

          <h1 className="text-3xl font-bold tracking-tight">{participant.name}</h1>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4 shrink-0" aria-hidden />
              <span>{participant.email}</span>
            </div>
            {participant.phoneNumber && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0" aria-hidden />
                <span>{participant.phoneNumber}</span>
              </div>
            )}
            {participant.country && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span>{participant.country}</span>
              </div>
            )}
            {eventName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4 shrink-0" aria-hidden />
                <span>{eventName}</span>
              </div>
            )}
            {participant.registrationDate && (
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <span className="text-xs">
                  Registered {format(new Date(participant.registrationDate), 'PPP')}
                </span>
              </div>
            )}
          </dl>
        </div>
      </div>

      {participant.biography && (
        <>
          <Separator />
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {participant.biography}
          </p>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {hasCompany && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Briefcase className="size-4" aria-hidden />
                Company
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {participant.companyName && (
                <div>
                  <span className="text-muted-foreground">Name · </span>
                  {participant.companyName}
                </div>
              )}
              {participant.companyPosition && (
                <div>
                  <span className="text-muted-foreground">Position · </span>
                  {participant.companyPosition}
                </div>
              )}
              {participant.companyWebsite && (
                <div className="flex items-center gap-1">
                  <Globe className="size-3.5 text-muted-foreground shrink-0" aria-hidden />
                  <a
                    href={participant.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:underline underline-offset-4"
                  >
                    {participant.companyWebsite}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {hasPresentation && (
          <Card className={hasCompany ? '' : 'sm:col-span-2'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Presentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {participant.presentationTopic && (
                <div>
                  <span className="text-muted-foreground">Topic · </span>
                  {participant.presentationTopic}
                </div>
              )}
              {participant.presentationSummary && (
                <p className="text-muted-foreground/80 whitespace-pre-wrap">
                  {participant.presentationSummary}
                </p>
              )}
              {participant.technicalRequirements && (
                <div>
                  <span className="text-muted-foreground">Tech requirements · </span>
                  {participant.technicalRequirements}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {participant.socialLinks && participant.socialLinks.length > 0 && (
          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Social links
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {participant.socialLinks.map((link: any, i: number) => (
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
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-8 md:px-8">
        <Suspense fallback={<ParticipantDetailSkeleton />}>
          <ParticipantDetail participantId={id} userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}
