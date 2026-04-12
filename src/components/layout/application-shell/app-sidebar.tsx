'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { SidebarModule } from './types'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  modules: SidebarModule[]
  activeModuleId: string
  onModuleChange: (moduleId: string) => void
  logo?: {
    src: string
    alt: string
  }
}

export function AppSidebar({
  modules,
  activeModuleId,
  onModuleChange,
  logo = { src: '/logo.png', alt: 'Logo' },
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <Link href="/dash">
                <div className="flex aspect-square size-8 items-center justify-center rounded-sm">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Prevema</span>
                  <span className="truncate text-xs">Event Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {modules.map((module) => (
                <SidebarMenuItem key={module.id}>
                  <SidebarMenuButton
                    tooltip={{
                      children: module.label,
                      hidden: false,
                    }}
                    onClick={() => onModuleChange(module.id)}
                    isActive={activeModuleId === module.id}
                    className="px-2.5 md:px-2"
                    asChild={!!module.path}
                  >
                    {module.path ? (
                      <Link href={module.path}>
                        <module.icon />
                        <span>{module.label}</span>
                      </Link>
                    ) : (
                      <>
                        <module.icon />
                        <span>{module.label}</span>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{
                children: 'Settings',
                hidden: false,
              }}
              className="px-2.5 md:px-2"
              asChild
            >
              <Link href="/dash/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
