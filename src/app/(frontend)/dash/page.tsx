import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Building2, ImageIcon, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { getDashboardCounts, getUpcomingEvent } from './actions'
import { DashboardEventCard } from './components/DashboardEventCard'
import {
  getEventLocation,
  getEventDescription,
  getEventImageUrl,
} from './events/utils/event-card-helpers'

export default async function DashboardPage() {
  const [counts, upcomingEvent] = await Promise.all([
    getDashboardCounts(),
    getUpcomingEvent(),
  ])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your event management dashboard
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dash/events/create">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.events}</div>
              <p className="text-xs text-muted-foreground">Active and upcoming events</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dash/participants">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.participants}</div>
              <p className="text-xs text-muted-foreground">Registered participants</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dash/partners">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partners</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.partners}</div>
              <p className="text-xs text-muted-foreground">Active partnerships</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dash/assets">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Creatives</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.creatives}</div>
              <p className="text-xs text-muted-foreground">Email and image templates</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Event Section */}
      {upcomingEvent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Upcoming Event</h2>
              <p className="text-muted-foreground">Your next scheduled event</p>
            </div>
          </div>
          <Link href={`/dash/events/${upcomingEvent.id}`} className="block">
            <DashboardEventCard
              image={getEventImageUrl(upcomingEvent.image)}
              startDate={upcomingEvent.startDate}
              endDate={upcomingEvent.endDate}
              location={getEventLocation(upcomingEvent)}
              title={upcomingEvent.name}
              description={getEventDescription(upcomingEvent)}
              eventType={
                upcomingEvent.eventType === 'physical'
                  ? 'in-person'
                  : upcomingEvent.eventType === 'online'
                    ? 'online'
                    : undefined
              }
            />
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started with managing your events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {counts.events === 0 ? (
                <div className="flex items-center gap-4 rounded-lg border p-4 cursor-not-allowed">
                  <Calendar className="h-8 w-8 text-muted-foreground/50" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-muted-foreground/60">Manage Events</h3>
                    <p className="text-sm text-muted-foreground/50">Create and organize your events</p>
                  </div>
                  <Link href="/dash/events/create" className="shrink-0">
                    <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/40 hover:bg-primary/10 transition-colors cursor-pointer">
                      <PlusCircle className="h-3 w-3" />
                      Create event
                    </Badge>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/dash/events/create"
                  className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <Calendar className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Manage Events</h3>
                    <p className="text-sm text-muted-foreground">Create and organize your events</p>
                  </div>
                </Link>
              )}

              {counts.participants === 0 ? (
                <div className="flex items-center gap-4 rounded-lg border p-4 cursor-not-allowed">
                  <Users className="h-8 w-8 text-muted-foreground/50" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-muted-foreground/60">View Participants</h3>
                    <p className="text-sm text-muted-foreground/50">Manage event participants and registrations</p>
                  </div>
                  <Link href="/dash/participants/create" className="shrink-0">
                    <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/40 hover:bg-primary/10 transition-colors cursor-pointer">
                      <PlusCircle className="h-3 w-3" />
                      Create new
                    </Badge>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/dash/participants"
                  className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">View Participants</h3>
                    <p className="text-sm text-muted-foreground">Manage event participants and registrations</p>
                  </div>
                </Link>
              )}

              {counts.partners === 0 ? (
                <div className="flex items-center gap-4 rounded-lg border p-4 cursor-not-allowed">
                  <Building2 className="h-8 w-8 text-muted-foreground/50" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-muted-foreground/60">Manage Partners</h3>
                    <p className="text-sm text-muted-foreground/50">Work with sponsors and exhibitors</p>
                  </div>
                  <Link href="/dash/partners/create" className="shrink-0">
                    <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/40 hover:bg-primary/10 transition-colors cursor-pointer">
                      <PlusCircle className="h-3 w-3" />
                      Create new
                    </Badge>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/dash/partners"
                  className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <Building2 className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Manage Partners</h3>
                    <p className="text-sm text-muted-foreground">Work with sponsors and exhibitors</p>
                  </div>
                </Link>
              )}

              <Link
                href="/dash/assets"
                className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <ImageIcon className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Manage Creatives</h3>
                  <p className="text-sm text-muted-foreground">Create email and image templates</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Select an event from the dropdown to view activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
