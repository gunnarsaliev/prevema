'use client'

import { Suspense, useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { DubSidebarLayout } from '@/components/layout/dub-sidebar'
import { DubSidebarUserMenu } from '@/components/layout/dub-sidebar-user-menu'
import { EventSwitcher } from '@/components/event-switcher'
import { Button } from '@/components/ui/button'
import { Plus, Bell, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { dashSidebarConfig } from '@/config/dash-sidebar-config'
import { EventProvider, type Event } from '@/providers/Event'
import { PermissionsProvider } from '@/providers/Permissions'
import { useAuth } from '@/providers/Auth'

export function DashClientLayout({
  children,
  initialEvents,
  permissions,
}: {
  children: React.ReactNode
  initialEvents: Event[]
  permissions: {
    role: 'owner' | 'admin' | 'editor' | 'viewer' | null
    canEdit: boolean
    canAdmin: boolean
    isOwner: boolean
  }
}) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [activeModuleId, setActiveModuleId] = useState('dashboard')

  // Determine active module based on pathname
  useMemo(() => {
    if (pathname.startsWith('/dash/events')) {
      setActiveModuleId('events')
    } else if (
      pathname.startsWith('/dash/participants') ||
      pathname.startsWith('/dash/partners') ||
      pathname.startsWith('/dash/participant-roles') ||
      pathname.startsWith('/dash/partner-types')
    ) {
      setActiveModuleId('guests')
    } else if (pathname.startsWith('/dash/assets')) {
      setActiveModuleId('assets')
    } else if (pathname.startsWith('/dash/settings')) {
      setActiveModuleId('settings')
    } else {
      setActiveModuleId('dashboard')
    }
  }, [pathname])

  // Extract profileImage URL from user object
  const profileImageUrl =
    user?.profileImage && typeof user.profileImage === 'object'
      ? (user.profileImage as any).url
      : undefined

  const userData = user
    ? { name: user.name ?? user.email, email: user.email, avatar: profileImageUrl || '' }
    : null

  // Top slot content (Event Switcher + New Button)
  const topSlot = (
    <>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <EventSwitcher />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:bg-accent"
        >
          <Bell className="size-4" />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" />
            New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem>New Event</DropdownMenuItem>
          <DropdownMenuItem>New Participant</DropdownMenuItem>
          <DropdownMenuItem>New Partner</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  return (
    <Suspense>
      <PermissionsProvider
        role={permissions.role}
        canEdit={permissions.canEdit}
        canAdmin={permissions.canAdmin}
        isOwner={permissions.isOwner}
      >
        <EventProvider initialEvents={initialEvents}>
          <DubSidebarLayout
            config={dashSidebarConfig}
            activeModuleId={activeModuleId}
            onModuleChange={setActiveModuleId}
            topSlot={topSlot}
            userMenuSlot={userData ? <DubSidebarUserMenu user={userData} /> : undefined}
          >
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 bg-slate-100 shadow-lg">
              {children}
            </div>
          </DubSidebarLayout>
        </EventProvider>
      </PermissionsProvider>
    </Suspense>
  )
}
