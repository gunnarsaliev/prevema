'use client'

import { Suspense, useState, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ApplicationShell } from '@/components/layout/application-shell'
import { appShellModules } from '@/config/app-shell-config'
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
  const router = useRouter()
  const { user } = useAuth()
  const [activeModuleId, setActiveModuleId] = useState('dashboard')

  // Determine active module based on pathname
  useMemo(() => {
    if (pathname.startsWith('/dash/events')) {
      setActiveModuleId('events')
    } else if (
      pathname.startsWith('/dash/participants') ||
      pathname.startsWith('/dash/participant-roles')
    ) {
      setActiveModuleId('guests')
    } else if (
      pathname.startsWith('/dash/partners') ||
      pathname.startsWith('/dash/partner-types')
    ) {
      setActiveModuleId('partners')
    } else if (pathname.startsWith('/dash/image-generator')) {
      setActiveModuleId('image-generator')
    } else if (pathname.startsWith('/dash/assets')) {
      setActiveModuleId('assets')
    } else if (pathname.startsWith('/dash/help')) {
      setActiveModuleId('help')
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
    : undefined

  // Handle module change with navigation
  const handleModuleChange = (moduleId: string) => {
    setActiveModuleId(moduleId)
    const module = appShellModules.find((m) => m.id === moduleId)
    if (module?.path) {
      router.push(module.path)
    }
  }

  return (
    <Suspense>
      <PermissionsProvider
        role={permissions.role}
        canEdit={permissions.canEdit}
        canAdmin={permissions.canAdmin}
        isOwner={permissions.isOwner}
      >
        <EventProvider initialEvents={initialEvents}>
          <ApplicationShell
            modules={appShellModules}
            activeModuleId={activeModuleId}
            onModuleChange={handleModuleChange}
            user={userData}
          >
            {children}
          </ApplicationShell>
        </EventProvider>
      </PermissionsProvider>
    </Suspense>
  )
}
