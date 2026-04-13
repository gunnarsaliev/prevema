'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Mail,
} from 'lucide-react'
import { BottomBar } from '@/components/BottomBar'
import type { EmailLog } from '@/payload-types'
import { cn } from '@/lib/utils'

interface Props {
  email: EmailLog | null
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function EmailDetailPanel({ email }: Props) {
  if (!email) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Mail className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">Select an email</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Choose an email from the inbox to view its contents
        </p>
      </div>
    )
  }

  const status = statusConfig[email.status] || statusConfig.sent
  const hasAttachments = email.attachments && email.attachments.length > 0
  const isInbound = email.direction === 'inbound'

  // For the avatar, show the sender's initials (like Gmail does)
  const senderDisplayName = email.fromName || email.fromEmail?.split('@')[0] || 'Unknown'
  const recipientDisplayName = email.toName || email.toEmail?.split('@')[0] || 'me'

  const dateStr = email.sentAt || email.createdAt
  const emailDate = new Date(dateStr)
  const timeAgo = formatDistanceToNow(emailDate, { addSuffix: true })
  const formattedTime = format(emailDate, 'h:mm a')

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 min-w-0 overflow-hidden w-full">
      {/* Gmail-style Header - Subject line */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 overflow-hidden">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-normal text-foreground">
            {email.subject || '(No Subject)'}
          </h1>
          <Badge variant={status.variant} className="gap-1 shrink-0 text-xs">
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Email Content */}
      <ScrollArea className="flex-1 min-h-0 w-full">
        <div className="px-6 pb-6 max-w-full overflow-hidden">
          {/* Gmail-style Sender Info */}
          <div className="flex items-start gap-3 mb-6">
            <Avatar className="size-10 shrink-0 mt-0.5">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {getInitials(senderDisplayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{senderDisplayName}</span>
                    <span className="text-muted-foreground text-sm">&lt;{email.fromEmail}&gt;</span>
                  </div>
                  <div className="text-sm text-muted-foreground">to {recipientDisplayName}</div>
                </div>
                <div className="text-sm text-muted-foreground shrink-0">
                  {formattedTime} ({timeAgo})
                </div>
              </div>
            </div>
          </div>

          {/* Email Body - Gmail style card */}
          <div className="border rounded-lg bg-card overflow-hidden">
            <div className="p-8">
              {email.textContent ? (
                <div className="text-base leading-7 whitespace-pre-line font-sans text-foreground">
                  {email.textContent}
                </div>
              ) : (
                <div className="text-base text-muted-foreground italic">No content available</div>
              )}
            </div>
          </div>

          {/* Attachments */}
          {hasAttachments && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
                <Paperclip className="h-4 w-4" />
                {email.attachments?.length} Attachment{email.attachments?.length !== 1 ? 's' : ''}
              </h4>
              <div className="flex flex-wrap gap-2">
                {email.attachments?.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {attachment.filename}
                      </p>
                      {attachment.size && (
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(attachment.size)}
                        </p>
                      )}
                    </div>
                    {attachment.url && (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline shrink-0 ml-2"
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {email.errorMessage && (
            <div className="mt-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Error Details
              </h4>
              <pre className="text-xs text-destructive whitespace-pre-wrap font-mono">
                {email.errorMessage}
              </pre>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Bar - Template & Variables Info */}
      {email.direction === 'outbound' && (
        <BottomBar
          templateName={email.templateName}
          triggerEvent={email.triggerEvent}
          variables={email.variables}
        />
      )}
    </div>
  )
}
