import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import { format } from 'date-fns'
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Globe,
  Building2,
  Clock,
  Users,
  Lightbulb,
  BookOpen,
  Sparkles,
} from 'lucide-react'

import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import type { Media } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { getDashboardEvent } from '../data'
import { EventDetailSkeleton } from './components/EventDetailSkeleton'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  planning: 'secondary',
  open: 'default',
  closed: 'outline',
  archived: 'destructive',
}

interface EventDetailProps {
  eventId: string
  userId: number
}

async function EventDetail({ eventId, userId }: EventDetailProps) {
  const event = await getDashboardEvent(eventId, userId)

  if (!event) notFound()

  const image =
    event.image && typeof event.image === 'object' && 'url' in event.image
      ? (event.image as Media).url
      : null

  const startDate = event.startDate ? new Date(event.startDate) : null
  const endDate = event.endDate ? new Date(event.endDate) : null

  const location = event.where || event.address || (event.eventType === 'online' ? null : null)

  return (
    <article className="mx-auto max-w-3xl space-y-8 pb-16">
      {/* Back link */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/dashboard/events">
          <ArrowLeft className="size-4" />
          All events
        </Link>
      </Button>

      {/* Hero image */}
      {image && (
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src={image}
            alt={event.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* Title + meta */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {event.status && (
            <Badge variant={STATUS_VARIANT[event.status] ?? 'secondary'} className="capitalize">
              {event.status}
            </Badge>
          )}
          {event.eventType && (
            <Badge variant="outline" className="gap-1 capitalize">
              {event.eventType === 'online' ? (
                <Globe className="size-3" aria-hidden />
              ) : (
                <Building2 className="size-3" aria-hidden />
              )}
              {event.eventType}
            </Badge>
          )}
          {event.theme && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="size-3" aria-hidden />
              {event.theme}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>

        {/* Date / location row */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {startDate && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              <span>{format(startDate, 'PPP')}</span>
              {endDate && (
                <>
                  <span>→</span>
                  <span>{format(endDate, 'PPP')}</span>
                </>
              )}
            </span>
          )}
          {event.timezone && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 shrink-0" aria-hidden />
              {event.timezone}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {location}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Description */}
      {event.description && (
        <section className="space-y-2">
          <p className="text-base leading-relaxed text-foreground/80">{event.description}</p>
        </section>
      )}

      {/* Detail cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {event.why && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Lightbulb className="size-4" aria-hidden />
                Why
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{event.why}</p>
            </CardContent>
          </Card>
        )}

        {event.what && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <BookOpen className="size-4" aria-hidden />
                What
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{event.what}</p>
            </CardContent>
          </Card>
        )}

        {event.who && (
          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Users className="size-4" aria-hidden />
                Who
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{event.who}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </article>
  )
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const rawOrgIds = await getUserOrganizationIds(payload, user)
  const organizationIds = rawOrgIds.map(Number)
  const userId = typeof user.id === 'number' ? user.id : Number(user.id)

  // Basic org-scope guard: verify event belongs to user's orgs
  if (organizationIds.length === 0) notFound()

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-8 md:px-8">
        <Suspense fallback={<EventDetailSkeleton />}>
          <EventDetail eventId={id} userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}
