'use client'

import Link from 'next/link'
import { Mail, CheckCircle2, Clock, AlertCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { EmailLogItem } from './types'

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  sent: {
    label: 'Sent',
    icon: Send,
    className: 'text-sky-600 dark:text-sky-400',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    className: 'text-emerald-600 dark:text-emerald-400',
  },
  opened: {
    label: 'Opened',
    icon: CheckCircle2,
    className: 'text-emerald-600 dark:text-emerald-400',
  },
  clicked: {
    label: 'Clicked',
    icon: CheckCircle2,
    className: 'text-emerald-600 dark:text-emerald-400',
  },
  scheduled: {
    label: 'Scheduled',
    icon: Clock,
    className: 'text-amber-600 dark:text-amber-400',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    className: 'text-destructive',
  },
  bounced: {
    label: 'Bounced',
    icon: AlertCircle,
    className: 'text-destructive',
  },
}

const TRIGGER_LABELS: Record<string, string> = {
  manual: 'Manual',
  scheduled: 'Scheduled',
  'participant.created': 'Participant Registration',
  'participant.updated': 'Participant Update',
  'partner.invited': 'Partner Invite',
  'event.published': 'Event Published',
  'form.submitted': 'Form Submission',
  custom: 'Custom',
  test: 'Test',
  inbound: 'Inbound',
}

function StatusIcon({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.sent
  const Icon = config.icon
  return <Icon className={cn('size-3.5 shrink-0', config.className)} />
}

interface EmailHistoryWidgetProps {
  items: EmailLogItem[]
  title?: string
  viewAllHref?: string
}

export function EmailHistoryWidget({
  items,
  title = 'Email History',
  viewAllHref,
}: EmailHistoryWidgetProps) {
  return (
    <div className="flex h-full w-full flex-col rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium sm:text-base">{title}</h2>
        </div>
        {viewAllHref && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href={viewAllHref}>View All</Link>
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
          <Mail className="size-7 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No emails sent yet</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-1">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/dash/email-logs/${item.id}`}
                className="flex min-w-0 items-start gap-3 rounded-lg border bg-background px-3 py-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="mt-0.5">
                  <StatusIcon status={item.status} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground leading-snug">
                    {item.subject}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {item.toName ? `${item.toName} ` : ''}
                    <span className="opacity-70">{item.toEmail}</span>
                  </p>
                  {item.triggerEvent && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                      {TRIGGER_LABELS[item.triggerEvent] ?? item.triggerEvent}
                      {item.templateName ? ` · ${item.templateName}` : ''}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap">{item.time}</p>
                  <p
                    className={cn(
                      'mt-0.5 text-[10px] font-medium capitalize',
                      STATUS_CONFIG[item.status]?.className ?? 'text-muted-foreground',
                    )}
                  >
                    {STATUS_CONFIG[item.status]?.label ?? item.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
