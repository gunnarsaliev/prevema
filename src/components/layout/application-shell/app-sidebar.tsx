'use client'

import * as React from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
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
      <SidebarHeader className="p-3">
        <Link href="/dash">
          <img src={logo.src} alt={logo.alt} className="size-14 object-contain" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-3 pt-0">
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="flex flex-col gap-2">
            {modules.map((module) => {
              const isActive = activeModuleId === module.id
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => onModuleChange(module.id)}
                  className={cn(
                    'flex aspect-square w-full items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground transition-all hover:rounded-xl hover:bg-primary hover:text-primary-foreground',
                    isActive && 'rounded-xl bg-primary text-primary-foreground',
                  )}
                  aria-label={module.label}
                  title={module.label}
                >
                  <module.icon className="size-6" />
                </button>
              )
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <Link
          href="/dash/settings"
          className="flex aspect-square w-full items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground transition-all hover:rounded-xl hover:bg-primary hover:text-primary-foreground"
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="size-6" />
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
