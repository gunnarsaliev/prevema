'use client'

import { Icon } from '@iconify/react'

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
import { sidebarModules } from './data'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeModule: string
  onModuleChange: (moduleId: string) => void
}

export function AppSidebar({ activeModule, onModuleChange, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Icon icon="mdi:account-circle" className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {sidebarModules.map((moduleItem) => (
                <SidebarMenuItem key={moduleItem.id}>
                  <SidebarMenuButton
                    tooltip={{
                      children: moduleItem.label,
                      hidden: false,
                    }}
                    onClick={() => onModuleChange(moduleItem.id)}
                    isActive={activeModule === moduleItem.id}
                    className="px-2.5 md:px-2"
                  >
                    <moduleItem.icon />
                    <span>{moduleItem.label}</span>
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
            >
              <Icon icon="mdi:account-cog" className="size-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
