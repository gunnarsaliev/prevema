'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Tag,
  Handshake,
  Layers,
} from 'lucide-react'

import { ApplicationShell } from '@/components/layout/application-shell'
import { PermissionsProvider } from '@/providers/Permissions'
import { useAuth } from '@/providers/Auth'
import type { SidebarModule } from '@/components/layout/application-shell/types'

const dashboardModules: SidebarModule[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'events', label: 'Events', icon: Calendar, path: '/dashboard/events' },
  { id: 'participants', label: 'Participants', icon: Users, path: '/dashboard/participants' },
  { id: 'participant-roles', label: 'Roles', icon: Tag, path: '/dashboard/participant-roles' },
  { id: 'partners', label: 'Partners', icon: Handshake, path: '/dashboard/partners' },
  { id: 'partner-types', label: 'Types', icon: Layers, path: '/dashboard/partner-types' },
]

interface Permissions {
  role: 'owner' | 'admin' | 'editor' | 'viewer' | null
  canEdit: boolean
  canAdmin: boolean
  isOwner: boolean
}

export function DashboardClientLayout({
  children,
  permissions,
}: {
  children: React.ReactNode
  permissions: Permissions
}) {
  const pathname = usePathname()
  const { user } = useAuth()

  const activeModuleId = useMemo(() => {
    const sorted = [...dashboardModules]
      .filter((m) => m.path)
      .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))
    return sorted.find((m) => m.path && pathname.startsWith(m.path))?.id ?? 'overview'
  }, [pathname])

  const profileImageUrl =
    user?.profileImage && typeof user.profileImage === 'object'
      ? (user.profileImage as any).url
      : undefined

  const userData = user
    ? { name: user.name ?? user.email, email: user.email, avatar: profileImageUrl ?? '' }
    : undefined

  return (
    <PermissionsProvider
      role={permissions.role}
      canEdit={permissions.canEdit}
      canAdmin={permissions.canAdmin}
      isOwner={permissions.isOwner}
    >
      <ApplicationShell
        modules={dashboardModules}
        activeModuleId={activeModuleId}
        onModuleChange={() => {}}
        user={userData}
        logo={{ src: '/logo.png', alt: 'Logo', href: '/dashboard' }}
        mobileNavigation
      >
        {children}
      </ApplicationShell>
    </PermissionsProvider>
  )
}
