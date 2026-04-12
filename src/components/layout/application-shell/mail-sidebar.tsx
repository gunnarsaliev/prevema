'use client'

import * as React from 'react'
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

export interface MailItem {
  id: string
  name: string
  email: string
  avatar?: string
  verified?: boolean
  subject: string
  date: string
  teaser: string
  read: boolean
  starred?: boolean
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

function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 22 22"
      className={cn('size-4 text-[#38bdf8]', className)}
      fill="currentColor"
    >
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
    </svg>
  )
}

interface MailSidebarProps {
  title: string
  mails: MailItem[]
  selectedEmailId: string | null
  onEmailSelect: (emailId: string) => void
}

export function MailSidebar({
  title,
  mails,
  selectedEmailId,
  onEmailSelect,
}: MailSidebarProps) {
  return (
    <Sidebar collapsible="none" className="w-full shrink-0 border-r md:flex md:w-[320px]">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-base font-medium text-foreground">{title}</div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Unreads</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
        <SidebarInput placeholder="Type to search..." />
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-viewport]>div]:!block">
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
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}
