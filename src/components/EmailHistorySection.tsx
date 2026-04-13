'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MousePointer,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmailDetailSheet } from '@/components/EmailDetailSheet'
import type { EmailLog } from '@/payload-types'

interface Props {
  recipientEmail: string
  className?: string
}

const statusConfig: Record<
  string,
  {
    label: string
    icon: React.ReactNode
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  sent: { label: 'Sent', icon: <Send className="h-3 w-3" />, variant: 'secondary' },
  delivered: { label: 'Delivered', icon: <CheckCircle2 className="h-3 w-3" />, variant: 'default' },
  failed: { label: 'Failed', icon: <XCircle className="h-3 w-3" />, variant: 'destructive' },
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
  scheduled: { label: 'Scheduled', icon: <Clock className="h-3 w-3" />, variant: 'outline' },
  opened: { label: 'Opened', icon: <Eye className="h-3 w-3" />, variant: 'default' },
  clicked: { label: 'Clicked', icon: <MousePointer className="h-3 w-3" />, variant: 'default' },
}

const triggerLabels: Record<string, string> = {
  manual: 'Manual',
  scheduled: 'Scheduled',
  'participant.created': 'Registration',
  'participant.updated': 'Status Update',
  'partner.invited': 'Invitation',
  'event.published': 'Event Published',
  'form.submitted': 'Form Submission',
  custom: 'Custom',
  test: 'Test',
}

export function EmailHistorySection({ recipientEmail, className }: Props) {
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/email-history?email=${encodeURIComponent(recipientEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        setEmails(data.emails || [])
      })
      .catch((err) => {
        console.error('Failed to load email history:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [recipientEmail])

  const handleEmailClick = (email: EmailLog) => {
    setSelectedEmail(email)
    setSheetOpen(true)
  }

  return (
    <>
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email History
          </h3>
          {!loading && emails.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {emails.length} {emails.length === 1 ? 'email' : 'emails'}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[72px] w-full rounded-xl" />
            <Skeleton className="h-[72px] w-full rounded-xl" />
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed text-center gap-2">
            <Mail className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No emails sent to this recipient yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {emails.map((email) => {
              const status = statusConfig[email.status] || statusConfig.sent
              const dateStr = email.sentAt || email.createdAt
              return (
                <button
                  key={email.id}
                  type="button"
                  onClick={() => handleEmailClick(email)}
                  className="w-full text-left px-4 py-3 rounded-xl border bg-card hover:bg-muted/40 active:bg-muted/60 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium truncate leading-snug">
                        {email.subject || '(No Subject)'}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={status.variant} className="gap-1 text-[11px] px-1.5 py-0">
                          {status.icon}
                          {status.label}
                        </Badge>
                        {email.triggerEvent && (
                          <Badge
                            variant="outline"
                            className="text-[11px] px-1.5 py-0 text-muted-foreground"
                          >
                            {triggerLabels[email.triggerEvent] || email.triggerEvent}
                          </Badge>
                        )}
                        {email.templateName && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            {email.templateName}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                      {format(new Date(dateStr), 'MMM d, yyyy')}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <EmailDetailSheet email={selectedEmail} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
