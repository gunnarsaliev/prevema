'use client'

import { Suspense, useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { DubSidebarLayout } from '@/components/layout/dub-sidebar'
import { DubSidebarUserMenu } from '@/components/layout/dub-sidebar-user-menu'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
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

  // Notification bell slot (for sidebar rail)
  const notificationBellSlot = (
    <Button
      variant="ghost"
      size="icon"
      className="size-11 text-muted-foreground hover:bg-accent active:bg-accent/80"
      aria-label="Notifications"
    >
      <Bell className="size-4" />
    </Button>
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
            notificationBellSlot={notificationBellSlot}
            userMenuSlot={userData ? <DubSidebarUserMenu user={userData} /> : undefined}
          >
            {children}
          </DubSidebarLayout>
        </EventProvider>
      </PermissionsProvider>
    </Suspense>
  )
}
