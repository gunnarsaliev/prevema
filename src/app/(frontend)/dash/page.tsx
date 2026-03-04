'use client'

import { useEvent } from '@/providers/Event'
import { usePermissions } from '@/providers/Permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Building2, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { selectedEvent } = useEvent()
  const { canEdit } = usePermissions()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedEvent ? `Managing: ${selectedEvent.name}` : 'Welcome to your event management dashboard'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active and upcoming events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Registered participants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partners</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active partnerships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">vs. last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started with managing your events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Link
                href="/dash/events"
                className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Manage Events</h3>
                  <p className="text-sm text-muted-foreground">Create and organize your events</p>
                </div>
              </Link>

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
              {selectedEvent ? (
                <div className="text-sm text-muted-foreground">
                  <p>Selected event: <span className="font-medium text-foreground">{selectedEvent.name}</span></p>
                  <p className="mt-2">Select an event from the dropdown to view activity</p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p>No event selected</p>
                  <p className="mt-2">Create or select an event to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
