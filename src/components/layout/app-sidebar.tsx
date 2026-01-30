import {
  Archive,
  Bug,
  CommandIcon,
  File,
  Inbox,
  Lightbulb,
  MailOpen,
  MessageSquare,
  MoreHorizontal,
  Search,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { LogoDropdown } from './logo-dropdown'

type NavItemId = 'inbox' | 'unassigned' | 'assigned' | 'drafts' | 'archived' | 'spam'

type BucketId = 'support' | 'bugs' | 'features' | 'internal'

type NavItem = {
  id: NavItemId
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  count?: number
}

type Bucket = {
  id: BucketId
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const navItems: NavItem[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, count: 6 },
  { id: 'unassigned', label: 'Unassigned', icon: MailOpen, count: 10 },
  { id: 'assigned', label: 'Assigned', icon: UserCheck, count: 3 },
  { id: 'drafts', label: 'Drafts', icon: File, count: 1 },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'spam', label: 'Spam', icon: Trash2 },
]

const buckets: Bucket[] = [
  { id: 'support', label: 'Support requests', icon: MessageSquare },
  { id: 'bugs', label: 'Bug reports', icon: Bug },
  { id: 'features', label: 'Feature requests', icon: Lightbulb },
  { id: 'internal', label: 'Internal', icon: Users },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeNavItem: NavItemId
  activeBucket: BucketId | null
  onNavItemChange: (id: NavItemId) => void
  onBucketChange: (id: BucketId | null) => void
  onSearchClick: () => void
}

export function AppSidebar({
  activeNavItem,
  activeBucket,
  onNavItemChange,
  onBucketChange,
  onSearchClick,
  className,
  ...props
}: AppSidebarProps) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  return (
    <Sidebar collapsible="offcanvas" variant="inset" className={cn(className)} {...props}>
      <SidebarHeader className={cn('flex h-14 flex-row items-center justify-between')}>
        <SidebarMenu>
          <SidebarMenuItem>
            <LogoDropdown isCollapsed={isCollapsed} />
          </SidebarMenuItem>
        </SidebarMenu>
        <Button variant="ghost" size="icon" className="size-7">
          <MoreHorizontal className="size-4" />
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="py-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onSearchClick} className="px-2">
                  <Search className="size-4" />
                  <span>Search</span>
                  <kbd className="ml-auto hidden items-center justify-center rounded-md font-mono font-medium text-muted-foreground/70 sm:flex">
                    <CommandIcon className="size-3 font-medium" strokeWidth={1.5} />
                    <span>K</span>
                  </kbd>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeNavItem === item.id && activeBucket === null
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => {
                        onNavItemChange(item.id)
                        onBucketChange(null)
                      }}
                      isActive={isActive}
                      className="px-2"
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                      {item.count !== undefined && (
                        <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Buckets</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {buckets.map((bucket) => {
                const Icon = bucket.icon
                return (
                  <SidebarMenuItem key={bucket.id}>
                    <SidebarMenuButton
                      onClick={() => onBucketChange(bucket.id)}
                      isActive={activeBucket === bucket.id}
                      className="px-2"
                    >
                      <Icon className="size-4" />
                      <span>{bucket.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
