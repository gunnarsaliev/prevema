import { Suspense } from 'react'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { Calendar, Users, Handshake, MapPin, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

import config from '@/payload.config'
import { getCachedDashboardCounts, getCachedUpcomingEvent, getCachedUserOrgIds } from '@/lib/cached-queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatCardsSkeleton, UpcomingEventSkeleton } from './components/OverviewSkeleton'
import { getEventLocation, getEventDescription } from '../dash/events/utils/event-card-helpers'

async function StatCards({ organizationIds }: { organizationIds: number[] }) {
  const counts = await getCachedDashboardCounts(organizationIds)

  const stats = [
    {
      label: 'Events',
      value: counts.events,
      icon: Calendar,
      href: '/dashboard/events',
      description: 'Active and upcoming',
    },
    {
      label: 'Participants',
      value: counts.participants,
      icon: Users,
      href: '/dashboard/participants',
      description: 'Registered participants',
    },
    {
      label: 'Partners',
      value: counts.partners,
      icon: Handshake,
      href: '/dashboard/partners',
      description: 'Active partnerships',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, href, description }) => (
        <Link key={href} href={href} className="group">
          <Card className="transition-colors group-hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

async function UpcomingEvent({ organizationIds }: { organizationIds: number[] }) {
  const event = await getCachedUpcomingEvent(organizationIds)

  if (!event) return null

  const location = getEventLocation(event)
  const description = getEventDescription(event)
  const startDate = event.startDate ? format(new Date(event.startDate), 'EEE, MMM d, yyyy') : null
  const endDate = event.endDate ? format(new Date(event.endDate), 'MMM d') : null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Upcoming Event
      </h2>
      <Link href={`/dashboard/events/${event.id}`} className="group block">
        <Card className="transition-colors group-hover:bg-muted/50">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {event.eventType && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {event.eventType === 'physical' ? 'in-person' : event.eventType}
                    </Badge>
                  )}
                  {startDate && (
                    <span className="text-xs text-muted-foreground">
                      {startDate}
                      {endDate ? ` – ${endDate}` : ''}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold leading-tight">{event.name}</h3>
                {location && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    {location}
                  </p>
                )}
                {description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              <ArrowRight
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

export default async function DashboardPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-8 md:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back{user.name ? `, ${user.name}` : ''}.
          </p>
        </header>

        <div className="space-y-8">
          <Suspense fallback={<StatCardsSkeleton />}>
            <StatCards organizationIds={organizationIds} />
          </Suspense>

          <Separator />

          <Suspense fallback={<UpcomingEventSkeleton />}>
            <UpcomingEvent organizationIds={organizationIds} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
