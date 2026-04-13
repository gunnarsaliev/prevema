'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  Mail,
  Send,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MousePointer,
  Paperclip,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { EmailLog } from '@/payload-types'

interface Props {
  emails: EmailLog[]
  onSelectEmail: (email: EmailLog) => void
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

export function EmailsList({ emails, onSelectEmail }: Props) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Mail className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No emails found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Emails will appear here once they are sent or received.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Direction</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[140px]">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((email) => {
            const status = statusConfig[email.status] || statusConfig.sent
            const hasAttachments = email.attachments && email.attachments.length > 0

            return (
              <TableRow
                key={email.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectEmail(email)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {email.direction === 'inbound' ? (
                      <Inbox className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Send className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-xs text-muted-foreground capitalize">
                      {email.direction}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate max-w-[300px]">
                      {email.subject || '(No Subject)'}
                    </span>
                    {hasAttachments && (
                      <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm truncate max-w-[180px] block">
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
                </TableCell>
                <TableCell>
                  <span className="text-sm truncate max-w-[180px] block">
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
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant} className="gap-1">
                    {status.icon}
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {email.sentAt
                      ? formatDistanceToNow(new Date(email.sentAt), { addSuffix: true })
                      : formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
