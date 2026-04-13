'use client'

import * as React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Send, Inbox } from 'lucide-react'
import type { EmailLog } from '@/payload-types'
import type { EmailTab } from './EmailsListClient'

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

interface EmailInboxSidebarProps {
  emails: EmailLog[]
  selectedEmailId: string | null
  onEmailSelect: (email: EmailLog) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  showUnreadsOnly: boolean
  onUnreadsToggle: (value: boolean) => void
  activeTab: EmailTab
  onTabChange: (tab: EmailTab) => void
  unreadInboxCount: number
}

export function EmailInboxSidebar({
  emails,
  selectedEmailId,
  onEmailSelect,
  searchQuery,
  onSearchChange,
  showUnreadsOnly,
  onUnreadsToggle,
  activeTab,
  onTabChange,
  unreadInboxCount,
}: EmailInboxSidebarProps) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col border-r bg-background">
      {/* Gmail-style Tabs */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => onTabChange('inbox')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'inbox'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Inbox className="size-4" />
          <span>Inbox</span>
          {unreadInboxCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
              {unreadInboxCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => onTabChange('sent')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'sent'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Send className="size-4" />
          <span>Sent</span>
        </button>
      </div>

      {/* Header with search and filters */}
      <div className="flex flex-col gap-3 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="h-8"
          />
        </div>
        {activeTab === 'inbox' && (
          <Label className="flex items-center gap-2 text-sm">
            <Switch
              className="shadow-none"
              checked={showUnreadsOnly}
              onCheckedChange={onUnreadsToggle}
            />
            <span>Unread only</span>
          </Label>
        )}
      </div>

      {/* Email List */}
      <ScrollArea className="flex-1">
        <div>
          {emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                {activeTab === 'inbox' ? (
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <Send className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'inbox' ? 'No received emails' : 'No sent emails'}
              </p>
            </div>
          ) : (
            emails.map((email) => {
              const isSelected = selectedEmailId === String(email.id)
              const isInbound = email.direction === 'inbound'
              const senderName = isInbound
                ? email.fromName || email.fromEmail?.split('@')[0] || 'Unknown'
                : email.toName || email.toEmail?.split('@')[0] || 'Unknown'
              const isUnread = !(email as any).read

              // Get preview text from textContent or htmlContent
              const previewText =
                email.textContent ||
                (email.htmlContent
                  ? email.htmlContent.replace(/<[^>]*>/g, '').slice(0, 100)
                  : '') ||
                'No content'

              return (
                <button
                  type="button"
                  key={email.id}
                  onClick={() => onEmailSelect(email)}
                  className={cn(
                    'flex w-full gap-3 border-b p-4 text-left text-sm leading-tight last:border-b-0 hover:bg-accent hover:text-accent-foreground',
                    isUnread && 'bg-blue-50/50 dark:bg-blue-950/20',
                    isSelected && 'bg-accent',
                  )}
                >
                  {/* Unread indicator */}
                  <div className="flex items-center justify-center w-2 shrink-0">
                    {isUnread && <div className="size-2 rounded-full bg-blue-500" />}
                  </div>
                  <Avatar className="mt-0.5 size-9 shrink-0">
                    <AvatarFallback
                      className={cn(
                        'text-xs font-medium text-primary-foreground',
                        isInbound ? 'bg-blue-500' : 'bg-green-500',
                      )}
                    >
                      {getInitials(senderName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1">
                        <span className={cn('truncate text-sm', isUnread && 'font-semibold')}>
                          {senderName}
                        </span>
                        {isInbound ? (
                          <Inbox className="size-3 shrink-0 text-blue-500" />
                        ) : (
                          <Send className="size-3 shrink-0 text-green-500" />
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(email.sentAt || email.createdAt), {
                          addSuffix: false,
                        })}
                      </span>
                    </div>
                    <p className={cn('mt-0.5 truncate text-sm', isUnread && 'font-medium')}>
                      {email.subject || '(No Subject)'}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {previewText}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
