import { CommandIcon, MoreHorizontal, Search, Users, UserCheck } from 'lucide-react'
import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { navItems, partners, guests, buckets, type NavItemId, type BucketId } from './data'
import { NavUser, type UserData } from './avatar-menu'

// Sample user data - replace with actual user data from your auth system
const userData: UserData = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp',
}

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
  const pathname = usePathname()
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
                const isActive = pathname === item.url && activeBucket === null
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive} className="px-2">
                      <Link href={item.url}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                        {item.count !== undefined && (
                          <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
                        )}
                      </Link>
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

        <SidebarGroup>
          <SidebarGroupLabel>Guests</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {guests.map((guest) => (
                <SidebarMenuItem key={guest.id}>
                  <SidebarMenuButton className="px-2">
                    <Users className="size-4" />
                    <span>{guest.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Partners</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {partners.map((partner) => (
                <SidebarMenuItem key={partner.id}>
                  <SidebarMenuButton className="px-2">
                    <UserCheck className="size-4" />
                    <span>{partner.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
