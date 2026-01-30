'use client'

import { BadgeCheck, Bell, ChevronDown, CreditCard, LogOut, Mail, Sparkles } from 'lucide-react'
import * as React from 'react'

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

import { userData, sidebarModules } from './data'
import { getInitials } from './utils'
import { AppSidebar } from './app-sidebar'

export interface ApplicationShell8Props {
  children?: React.ReactNode
}

export function ApplicationShell8({ children }: ApplicationShell8Props) {
  const [activeModule, setActiveModule] = React.useState('dashboard')

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId)
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar activeModule={activeModule} onModuleChange={handleModuleChange} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-2">
            {(() => {
              const moduleData = sidebarModules.find((m) => m.id === activeModule)
              if (!moduleData) return null
              return (
                <>
                  <moduleData.icon />
                  <span className="text-base font-medium">{moduleData.label}</span>
                </>
              )
            })()}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-auto items-center gap-2 px-2 py-1">
                <Avatar className="size-7">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden font-medium sm:inline">{userData.name}</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userData.name}</p>
                  <p className="text-xs text-muted-foreground">{userData.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles className="mr-2 size-4" />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck className="mr-2 size-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 size-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 size-4" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <SidebarInset className="flex-1 overflow-auto">
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default ApplicationShell8
