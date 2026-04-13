'use client'

import { format } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
} from 'lucide-react'
import type { EmailLog } from '@/payload-types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Props {
  email: EmailLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function EmailDetailSheet({ email, open, onOpenChange }: Props) {
  if (!email) return null

  const status = statusConfig[email.status] || statusConfig.sent
  const hasAttachments = email.attachments && email.attachments.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            {email.direction === 'inbound' ? (
              <div className="rounded-full bg-blue-100 p-2">
                <Inbox className="h-5 w-5 text-blue-600" />
              </div>
            ) : (
              <div className="rounded-full bg-green-100 p-2">
                <Send className="h-5 w-5 text-green-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <SheetTitle className="truncate">{email.subject || '(No Subject)'}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={status.variant} className="gap-1">
                  {status.icon}
                  {status.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {email.sentAt
                    ? format(new Date(email.sentAt), 'PPpp')
                    : format(new Date(email.createdAt), 'PPpp')}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-6">
          <div className="space-y-6 pr-4">
            {/* Email Headers */}
            <div className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                <span className="text-muted-foreground">From:</span>
                <span>
                  {email.fromName ? (
                    <>
                      <span className="font-medium">{email.fromName}</span>
                      <span className="text-muted-foreground ml-1">
                        &lt;{email.fromEmail}&gt;
                      </span>
                    </>
                  ) : (
                    email.fromEmail
                  )}
                </span>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                <span className="text-muted-foreground">To:</span>
                <span>
                  {email.toName ? (
                    <>
                      <span className="font-medium">{email.toName}</span>
                      <span className="text-muted-foreground ml-1">
                        &lt;{email.toEmail}&gt;
                      </span>
                    </>
                  ) : (
                    email.toEmail
                  )}
                </span>
              </div>
              {email.ccEmails && (
                <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                  <span className="text-muted-foreground">CC:</span>
                  <span>{email.ccEmails}</span>
                </div>
              )}
              {email.replyTo && (
                <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                  <span className="text-muted-foreground">Reply-To:</span>
                  <span>{email.replyTo}</span>
                </div>
              )}
              {email.messageId && (
                <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                  <span className="text-muted-foreground">Message ID:</span>
                  <span className="font-mono text-xs break-all">{email.messageId}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Email Content */}
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
                    className="prose prose-sm max-w-none bg-white rounded-md border p-4"
                    dangerouslySetInnerHTML={{ __html: email.htmlContent }}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No HTML content available
                  </div>
                )}
              </TabsContent>
              <TabsContent value="text" className="mt-4">
                {email.textContent ? (
                  <pre className="text-sm whitespace-pre-wrap bg-muted rounded-md p-4 font-mono">
                    {email.textContent}
                  </pre>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
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
                  <div className="space-y-2">
                    {email.attachments?.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-md border bg-muted/50"
                      >
                        <FileText className="h-5 w-5 text-muted-foreground" />
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
                            className="text-sm text-primary hover:underline"
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
