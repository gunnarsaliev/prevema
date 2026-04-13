'use client'

import { format } from 'date-fns'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Send,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MousePointer,
  Paperclip,
  FileText,
  Code,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState } from 'react'
import type { EmailLog } from '@/payload-types'

interface Props {
  email: EmailLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig: Record<
  string,
  {
    label: string
    icon: React.ReactNode
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  sent: {
    label: 'Sent',
    icon: <Send className="h-3 w-3" />,
    variant: 'secondary',
  },
  delivered: {
    label: 'Delivered',
    icon: <CheckCircle2 className="h-3 w-3" />,
    variant: 'default',
  },
  failed: {
    label: 'Failed',
    icon: <XCircle className="h-3 w-3" />,
    variant: 'destructive',
  },
  bounced: {
    label: 'Bounced',
    icon: <AlertTriangle className="h-3 w-3" />,
    variant: 'destructive',
  },
  complained: {
    label: 'Complained',
    icon: <AlertTriangle className="h-3 w-3" />,
    variant: 'destructive',
  },
  scheduled: {
    label: 'Scheduled',
    icon: <Clock className="h-3 w-3" />,
    variant: 'outline',
  },
  received: {
    label: 'Received',
    icon: <Inbox className="h-3 w-3" />,
    variant: 'default',
  },
  opened: {
    label: 'Opened',
    icon: <Eye className="h-3 w-3" />,
    variant: 'default',
  },
  clicked: {
    label: 'Clicked',
    icon: <MousePointer className="h-3 w-3" />,
    variant: 'default',
  },
}

export function EmailDetailSheet({ email, open, onOpenChange }: Props) {
  const [bottomBarOpen, setBottomBarOpen] = useState(false)

  if (!email) return null

  const status = statusConfig[email.status] || statusConfig.sent
  const hasAttachments = email.attachments && email.attachments.length > 0
  const sentDate = email.sentAt ? new Date(email.sentAt) : new Date(email.createdAt)

  const hasBottomBar =
    email.templateName ||
    email.triggerEvent ||
    email.variables ||
    hasAttachments ||
    email.errorMessage

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col gap-0 p-0">
        {/* Header */}
        <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-3 pr-6">
            <div
              className={`rounded-xl p-2.5 shrink-0 ${email.direction === 'inbound' ? 'bg-blue-100 dark:bg-blue-950' : 'bg-emerald-100 dark:bg-emerald-950'}`}
            >
              {email.direction === 'inbound' ? (
                <Inbox className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <Send className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <SheetTitle className="text-base leading-snug">
                {email.subject || '(No Subject)'}
              </SheetTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={status.variant} className="gap-1 text-xs">
                  {status.icon}
                  {status.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(sentDate, 'MMM d, yyyy · h:mm a')}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* From / To */}
        <div className="flex-shrink-0 divide-y border-b text-sm">
          <div className="flex items-baseline gap-3 px-6 py-2.5">
            <span className="text-muted-foreground w-8 shrink-0 text-xs uppercase tracking-wide">
              From
            </span>
            <span className="min-w-0">
              {email.fromName ? (
                <>
                  <span className="font-medium">{email.fromName}</span>{' '}
                  <span className="text-muted-foreground text-xs">&lt;{email.fromEmail}&gt;</span>
                </>
              ) : (
                <span>{email.fromEmail}</span>
              )}
            </span>
          </div>
          <div className="flex items-baseline gap-3 px-6 py-2.5">
            <span className="text-muted-foreground w-8 shrink-0 text-xs uppercase tracking-wide">
              To
            </span>
            <span className="min-w-0">
              {email.toName ? (
                <>
                  <span className="font-medium">{email.toName}</span>{' '}
                  <span className="text-muted-foreground text-xs">&lt;{email.toEmail}&gt;</span>
                </>
              ) : (
                <span>{email.toEmail}</span>
              )}
            </span>
          </div>
          {email.ccEmails && (
            <div className="flex items-baseline gap-3 px-6 py-2.5">
              <span className="text-muted-foreground w-8 shrink-0 text-xs uppercase tracking-wide">
                CC
              </span>
              <span>{email.ccEmails}</span>
            </div>
          )}
        </div>

        {/* Email HTML Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {email.htmlContent ? (
              <div
                className="prose prose-sm max-w-none bg-white dark:bg-zinc-950 rounded-xl border p-5 text-sm"
                dangerouslySetInnerHTML={{ __html: email.htmlContent }}
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">No content available.</p>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Bar */}
        {hasBottomBar && (
          <div className="flex-shrink-0 border-t bg-muted/30">
            <button
              type="button"
              onClick={() => setBottomBarOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-3">
                {email.templateName && (
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {email.templateName}
                  </span>
                )}
                {email.triggerEvent && (
                  <Badge variant="outline" className="text-[11px] gap-1 px-1.5 py-0">
                    <Code className="h-3 w-3" />
                    {email.triggerEvent}
                  </Badge>
                )}
                {hasAttachments && (
                  <span className="flex items-center gap-1">
                    <Paperclip className="h-3.5 w-3.5" />
                    {email.attachments?.length} attachment{email.attachments!.length > 1 ? 's' : ''}
                  </span>
                )}
                {email.errorMessage && (
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="h-3.5 w-3.5" />
                    Delivery error
                  </span>
                )}
              </div>
              {bottomBarOpen ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5 shrink-0" />
              )}
            </button>

            {bottomBarOpen && (
              <div className="px-5 pb-5 space-y-4 border-t overflow-y-auto max-h-72">
                {/* Attachments */}
                {hasAttachments && (
                  <div className="pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5" />
                      Attachments
                    </h4>
                    <div className="space-y-2">
                      {email.attachments?.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-background"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attachment.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.contentType}
                              {attachment.size && ` · ${formatBytes(attachment.size)}`}
                            </p>
                          </div>
                          {attachment.url && (
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline shrink-0"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error */}
                {email.errorMessage && (
                  <div className="pt-4 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
                    <h4 className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5" />
                      Delivery Error
                    </h4>
                    <pre className="text-xs text-destructive whitespace-pre-wrap font-mono">
                      {email.errorMessage}
                    </pre>
                  </div>
                )}

                {/* Variables */}
                {email.variables &&
                  (() => {
                    let parsed: Record<string, unknown> = {}
                    try {
                      parsed = JSON.parse(email.variables)
                    } catch {}
                    const entries = Object.entries(parsed)
                    if (entries.length === 0) return null
                    return (
                      <div className="pt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Variables Used
                        </h4>
                        <div className="rounded-xl border overflow-hidden bg-background">
                          {entries.map(([key, value], i) => (
                            <div
                              key={key}
                              className={`flex items-start gap-4 px-4 py-2.5 text-sm ${i !== entries.length - 1 ? 'border-b' : ''}`}
                            >
                              <span className="text-muted-foreground text-xs font-medium w-32 shrink-0 pt-px capitalize">
                                {key
                                  .replace(/([A-Z])/g, ' $1')
                                  .replace(/_/g, ' ')
                                  .trim()}
                              </span>
                              <span className="flex-1 min-w-0 break-words text-xs">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
