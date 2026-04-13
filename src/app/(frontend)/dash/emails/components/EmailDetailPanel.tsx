'use client'

import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Code,
  Mail,
} from 'lucide-react'
import type { EmailLog } from '@/payload-types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
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
  const senderName = isInbound 
    ? (email.fromName || email.fromEmail?.split('@')[0] || 'Unknown')
    : (email.toName || email.toEmail?.split('@')[0] || 'Unknown')

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Email Header */}
      <div className="flex-shrink-0 border-b p-6">
        <div className="flex items-start gap-4">
          <Avatar className="size-12 shrink-0">
            <AvatarFallback className={cn(
              "text-sm font-medium text-primary-foreground",
              isInbound ? "bg-blue-500" : "bg-green-500"
            )}>
              {getInitials(senderName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-semibold truncate">
                {email.subject || '(No Subject)'}
              </h2>
              <Badge variant={status.variant} className="gap-1 shrink-0">
                {status.icon}
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {isInbound ? (
                  <Inbox className="h-3.5 w-3.5 text-blue-500" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-green-500" />
                )}
                <span>
                  {email.fromName ? (
                    <>
                      <span className="font-medium text-foreground">{email.fromName}</span>
                      {' '}&lt;{email.fromEmail}&gt;
                    </>
                  ) : (
                    email.fromEmail
                  )}
                </span>
              </div>
              <span>→</span>
              <span>
                {email.toName ? (
                  <>
                    <span className="font-medium text-foreground">{email.toName}</span>
                    {' '}&lt;{email.toEmail}&gt;
                  </>
                ) : (
                  email.toEmail
                )}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>
                {email.sentAt
                  ? format(new Date(email.sentAt), 'PPpp')
                  : format(new Date(email.createdAt), 'PPpp')}
              </span>
              {hasAttachments && (
                <span className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {email.attachments?.length} attachment{email.attachments?.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Email Body */}
          <Tabs defaultValue="html" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="html" className="gap-1">
                <Code className="h-3 w-3" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-1">
                <FileText className="h-3 w-3" />
                Plain Text
              </TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="mt-4">
              {email.htmlContent ? (
                <div
                  className="prose prose-sm max-w-none bg-white rounded-md border p-6"
                  dangerouslySetInnerHTML={{ __html: email.htmlContent }}
                />
              ) : (
                <div className="text-sm text-muted-foreground italic p-4 bg-muted rounded-md">
                  No HTML content available
                </div>
              )}
            </TabsContent>
            <TabsContent value="text" className="mt-4">
              {email.textContent ? (
                <pre className="text-sm whitespace-pre-wrap bg-muted rounded-md p-6 font-mono">
                  {email.textContent}
                </pre>
              ) : (
                <div className="text-sm text-muted-foreground italic p-4 bg-muted rounded-md">
                  No plain text content available
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Attachments */}
          {hasAttachments && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments ({email.attachments?.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {email.attachments?.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-md border bg-muted/50"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.contentType}
                          {attachment.size && ` • ${formatBytes(attachment.size)}`}
                        </p>
                      </div>
                      {attachment.url && (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline shrink-0"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Error Message */}
          {email.errorMessage && (
            <>
              <Separator />
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
                <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Error Details
                </h4>
                <pre className="text-xs text-destructive whitespace-pre-wrap font-mono">
                  {email.errorMessage}
                </pre>
              </div>
            </>
          )}

          {/* Template Info (for outbound) */}
          {email.direction === 'outbound' && email.templateName && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Template Information</h4>
                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                  <span className="text-muted-foreground">Template:</span>
                  <span>{email.templateName}</span>
                </div>
                {email.triggerEvent && (
                  <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                    <span className="text-muted-foreground">Trigger:</span>
                    <Badge variant="outline">{email.triggerEvent}</Badge>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Variables (for outbound) */}
          {email.direction === 'outbound' && email.variables && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Variables Used</h4>
                <pre className="text-xs bg-muted rounded-md p-4 font-mono overflow-auto max-h-48">
                  {JSON.stringify(JSON.parse(email.variables), null, 2)}
                </pre>
              </div>
            </>
          )}

          {/* Metadata */}
          {email.metadata && Object.keys(email.metadata).length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Metadata</h4>
                <pre className="text-xs bg-muted rounded-md p-4 font-mono overflow-auto max-h-48">
                  {JSON.stringify(email.metadata, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
