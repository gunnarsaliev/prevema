'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BadgeCheck, Bell, ChevronDown, CreditCard, LogOut, Sparkles } from 'lucide-react'
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
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { AppSidebar } from './app-sidebar'
import type { ApplicationShellProps, SidebarModule } from './types'

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

interface UserMenuProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
}

function UserMenu({ user }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-auto items-center gap-2 px-2 py-1">
          <Avatar className="size-7">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="hidden font-medium sm:inline">{user.name}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dash/settings/subscription">
              <Sparkles className="mr-2 size-4" />
              Upgrade to Pro
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dash/settings/personal">
              <BadgeCheck className="mr-2 size-4" />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dash/settings/subscription">
              <CreditCard className="mr-2 size-4" />
              Billing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dash/settings/preferences">
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
  )
}

interface MobileBottomNavProps {
  modules: SidebarModule[]
  activeModuleId: string
  onModuleChange: (moduleId: string) => void
}

function MobileBottomNav({ modules, activeModuleId, onModuleChange }: MobileBottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${Math.min(modules.length, 5)}, minmax(0, 1fr))` }}
      >
        {modules.slice(0, 5).map((module) => {
          const Icon = module.icon
          const isActive = activeModuleId === module.id
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onModuleChange(module.id)}
              className={cn(
                'flex flex-col items-center justify-center py-3 text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label={module.label}
            >
              <Icon className="size-5" />
              <span className="mt-1 text-[10px]">{module.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function ApplicationShell({
  children,
  modules,
  activeModuleId,
  onModuleChange,
  user,
  logo = { src: '/logo.png', alt: 'Logo' },
  headerContent,
  mobileNavigation = true,
  secondarySidebar,
}: ApplicationShellProps) {
  const activeModule = modules.find((m) => m.id === activeModuleId)

  return (
    <SidebarProvider
      defaultOpen={false}
      className="h-svh overflow-hidden"
      style={
        {
          '--sidebar-width': '80px',
          '--sidebar-width-icon': '80px',
        } as React.CSSProperties
      }
    >
      <AppSidebar
        modules={modules}
        activeModuleId={activeModuleId}
        onModuleChange={onModuleChange}
        logo={logo}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center">
            {/* Mobile Logo */}
            <div className="mr-2 flex items-center md:hidden">
              <Link href="/dash" className="flex aspect-square size-8 items-center justify-center">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Header Content or Module Title */}
            {headerContent || (
              <div className="flex items-center gap-2">
                {activeModule && (
                  <>
                    <activeModule.icon className="size-5" />
                    <span className="text-base font-medium">{activeModule.label}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          {user && <UserMenu user={user} />}
        </header>

        {/* Main Content */}
        <div
          className={cn('flex min-h-0 flex-1 overflow-hidden', mobileNavigation && 'pb-14 md:pb-0')}
        >
          {/* Secondary Sidebar (e.g., Mail List) */}
          {secondarySidebar}
          <SidebarInset className="min-h-0 flex-1 overflow-auto">{children}</SidebarInset>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {mobileNavigation && (
        <MobileBottomNav
          modules={modules}
          activeModuleId={activeModuleId}
          onModuleChange={onModuleChange}
        />
      )}
    </SidebarProvider>
  )
}
