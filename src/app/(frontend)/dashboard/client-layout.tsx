'use client'

import { useMemo, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Tag,
  Handshake,
  Layers,
  BadgeCheck,
  Bell,
  CreditCard,
  LogOut,
  Sparkles,
  Settings,
  Building2,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DubSidebarLayout } from '@/components/layout/dub-sidebar'
import { PermissionsProvider } from '@/providers/Permissions'
import { useAuth } from '@/providers/Auth'
import type { DubSidebarConfig } from '@/components/layout/dub-sidebar/types'

const dashboardConfig: DubSidebarConfig = {
  railIcons: [
    { moduleId: 'overview', label: 'Overview', icon: LayoutDashboard, defaultPath: '/dashboard' },
    { moduleId: 'events', label: 'Events', icon: Calendar, defaultPath: '/dashboard/events' },
    { moduleId: 'participants', label: 'Participants', icon: Users, defaultPath: '/dashboard/participants' },
    { moduleId: 'partners', label: 'Partners', icon: Handshake, defaultPath: '/dashboard/partners' },
    { moduleId: 'manage', label: 'Manage', icon: Settings, defaultPath: '/dashboard/participant-roles' },
  ],
  modules: [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      defaultPath: '/dashboard',
      sections: [
        {
          id: 'main',
          items: [
            { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
          ],
        },
      ],
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      defaultPath: '/dashboard/events',
      sections: [
        {
          id: 'main',
          items: [
            { id: 'events', label: 'All Events', icon: Calendar, path: '/dashboard/events' },
          ],
        },
      ],
    },
    {
      id: 'participants',
      label: 'Participants',
      icon: Users,
      defaultPath: '/dashboard/participants',
      sections: [
        {
          id: 'main',
          items: [
            { id: 'participants', label: 'All Participants', icon: Users, path: '/dashboard/participants' },
            { id: 'participant-roles', label: 'Roles', icon: Tag, path: '/dashboard/participant-roles' },
          ],
        },
      ],
    },
    {
      id: 'partners',
      label: 'Partners',
      icon: Handshake,
      defaultPath: '/dashboard/partners',
      sections: [
        {
          id: 'main',
          items: [
            { id: 'partners', label: 'All Partners', icon: Handshake, path: '/dashboard/partners' },
            { id: 'partner-types', label: 'Types', icon: Layers, path: '/dashboard/partner-types' },
          ],
        },
      ],
    },
    {
      id: 'manage',
      label: 'Manage',
      icon: Settings,
      defaultPath: '/dashboard/participant-roles',
      sections: [
        {
          id: 'main',
          items: [
            { id: 'participant-roles', label: 'Participant Roles', icon: Tag, path: '/dashboard/participant-roles' },
            { id: 'partner-types', label: 'Partner Types', icon: Layers, path: '/dashboard/partner-types' },
          ],
        },
      ],
    },
  ],
}

const modulePathPrefixes: Record<string, string[]> = {
  overview: ['/dashboard'],
  events: ['/dashboard/events'],
  participants: ['/dashboard/participants', '/dashboard/participant-roles'],
  partners: ['/dashboard/partners', '/dashboard/partner-types'],
  manage: ['/dashboard/participant-roles', '/dashboard/partner-types'],
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  )
}

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
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const activeModuleId = useMemo(() => {
    // Most-specific match: check longest path prefixes first
    const sorted = Object.entries(modulePathPrefixes).flatMap(([moduleId, prefixes]) =>
      prefixes.map((prefix) => ({ moduleId, prefix })),
    )
    sorted.sort((a, b) => b.prefix.length - a.prefix.length)
    return sorted.find(({ prefix }) => pathname === prefix || pathname.startsWith(prefix + '/'))?.moduleId ?? 'overview'
  }, [pathname])

  const handleModuleChange = useCallback(
    (moduleId: string) => {
      const railIcon = dashboardConfig.railIcons.find((r) => r.moduleId === moduleId)
      if (railIcon) router.push(railIcon.defaultPath)
    },
    [router],
  )

  const profileImageUrl =
    user?.profileImage && typeof user.profileImage === 'object'
      ? (user.profileImage as any).url
      : undefined

  const userName = user?.name ?? user?.email ?? ''

  const userMenuSlot = user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-11 rounded-lg p-0">
          <Avatar className="size-7">
            <AvatarImage src={profileImageUrl} alt={userName} />
            <AvatarFallback className="text-xs">{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" side="right" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings/subscription">
              <Sparkles className="mr-2 size-4" />
              Upgrade to Pro
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings/personal">
              <BadgeCheck className="mr-2 size-4" />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings/organization">
              <Building2 className="mr-2 size-4" />
              Organization
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings/subscription">
              <CreditCard className="mr-2 size-4" />
              Billing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings/preferences">
              <Bell className="mr-2 size-4" />
              Notifications
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/logout">
            <LogOut className="mr-2 size-4" />
            Log out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : undefined

  return (
    <PermissionsProvider
      role={permissions.role}
      canEdit={permissions.canEdit}
      canAdmin={permissions.canAdmin}
      isOwner={permissions.isOwner}
    >
      <DubSidebarLayout
        config={dashboardConfig}
        activeModuleId={activeModuleId}
        onModuleChange={handleModuleChange}
        logoSrc="/logo.png"
        logoAlt="Logo"
        userMenuSlot={userMenuSlot}
      >
        {children}
      </DubSidebarLayout>
    </PermissionsProvider>
  )
}
