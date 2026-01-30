'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
} from '@/components/ui/sidebar'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { VerifiedIcon } from './verified-icon'
import { getInitials } from './utils'
import type { NavItem, MailItem } from './types'

interface MailSidebarProps {
  activeItem: NavItem
  mails: MailItem[]
  selectedEmailId: string | null
  onEmailSelect: (emailId: string) => void
}

export function MailSidebar({
  activeItem,
  mails,
  selectedEmailId,
  onEmailSelect,
}: MailSidebarProps) {
  return (
    <Sidebar collapsible="none" className="w-full shrink-0 border-r md:flex md:w-[320px]">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-base font-medium text-foreground">{activeItem?.title}</div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Unreads</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
        <SidebarInput placeholder="Type to search..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {mails.map((mail) => {
              const isSelected = selectedEmailId === mail.id
              return (
                <button
                  type="button"
                  key={mail.id}
                  onClick={() => onEmailSelect(mail.id)}
                  className={cn(
                    'flex w-full gap-3 border-b p-4 text-left text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    !mail.read && 'bg-muted/30',
                    isSelected && 'bg-sidebar-accent',
                  )}
                >
                  <Avatar className="mt-0.5 size-9 shrink-0">
                    <AvatarImage src={mail.avatar} alt={mail.name} />
                    <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
                      {getInitials(mail.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1">
                        <span className={cn('truncate text-sm', !mail.read && 'font-semibold')}>
                          {mail.name}
                        </span>
                        {mail.verified && <VerifiedIcon className="size-3.5 shrink-0" />}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{mail.date}</span>
                    </div>
                    <p className={cn('mt-0.5 truncate text-sm', !mail.read && 'font-medium')}>
                      {mail.subject}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {mail.teaser}
                    </p>
                  </div>
                </button>
              )
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
