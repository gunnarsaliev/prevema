import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { Metadata } from 'next'

import config from '@/payload.config'
import type { EmailLog } from '@/payload-types'
import { compileTemplate } from '@/utils/templateEngine'
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Badge } from '@/components/catalyst/badge'
import { Divider } from '@/components/catalyst/divider'
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from '@/components/catalyst/description-list'

const STATUS_COLOR: Record<string, 'zinc' | 'blue' | 'green' | 'red' | 'amber'> = {
  sent: 'blue',
  delivered: 'green',
  opened: 'green',
  clicked: 'green',
  scheduled: 'amber',
  failed: 'red',
  bounced: 'red',
  complained: 'red',
  received: 'zinc',
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  return { title: 'Email Log' }
}

export default async function EmailLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  let log: EmailLog | null = null
  try {
    log = (await payload.findByID({
      collection: 'email-logs',
      id,
      overrideAccess: false,
      user,
      depth: 1,
    })) as EmailLog
  } catch {
    notFound()
  }

  if (!log) notFound()

  // Parse stored variables JSON and compile the subject with them.
  // htmlContent is already fully rendered (compiled before storing).
  // compileTemplate already replaces missing vars with '' — then we strip
  // any leftover {{placeholder}} tokens so nothing unresolved is shown.
  let variables: Record<string, string> = {}
  if (log.variables) {
    try {
      variables = JSON.parse(log.variables)
    } catch {
      // ignore malformed JSON
    }
  }

  const resolvedSubject = log.subject
    ? compileTemplate(log.subject, variables)
        .replace(/\{\{\w+\}\}/g, '')
        .trim()
    : ''

  const sentDate = log.sentAt
    ? new Date(log.sentAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  const triggerLabel = log.triggerEvent
    ? (TRIGGER_LABELS[log.triggerEvent] ?? log.triggerEvent)
    : null

  return (
    <>
      <DashBreadcrumb items={[{ label: 'Dashboard', href: '/tw/dash' }, { label: 'Email Log' }]} />

      <div className="mt-4 lg:mt-8">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <Heading>{resolvedSubject || log.subject}</Heading>
              <Badge color={STATUS_COLOR[log.status] ?? 'zinc'} className="capitalize">
                {log.status}
              </Badge>
              {log.direction === 'inbound' && <Badge color="zinc">Inbound</Badge>}
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {log.fromName ? `${log.fromName} ` : ''}&lt;{log.fromEmail}&gt;
              {' → '}
              {log.toName ? `${log.toName} ` : ''}&lt;{log.toEmail}&gt;
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Subheading>Details</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>Subject</DescriptionTerm>
          <DescriptionDetails>{resolvedSubject || log.subject}</DescriptionDetails>

          <DescriptionTerm>From</DescriptionTerm>
          <DescriptionDetails>
            {log.fromName ? `${log.fromName} ` : ''}
            {log.fromEmail}
          </DescriptionDetails>

          <DescriptionTerm>To</DescriptionTerm>
          <DescriptionDetails>
            {log.toName ? `${log.toName} ` : ''}
            {log.toEmail}
          </DescriptionDetails>

          <DescriptionTerm>Sent</DescriptionTerm>
          <DescriptionDetails>{sentDate}</DescriptionDetails>

          <DescriptionTerm>Status</DescriptionTerm>
          <DescriptionDetails className="capitalize">{log.status}</DescriptionDetails>

          {triggerLabel && (
            <>
              <DescriptionTerm>Trigger</DescriptionTerm>
              <DescriptionDetails>{triggerLabel}</DescriptionDetails>
            </>
          )}

          {log.templateName && (
            <>
              <DescriptionTerm>Template</DescriptionTerm>
              <DescriptionDetails>{log.templateName}</DescriptionDetails>
            </>
          )}
        </DescriptionList>
      </div>

      {log.htmlContent && (
        <div className="mt-12">
          <Subheading>Email Preview</Subheading>
          <Divider className="mt-4" />
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-950/10 dark:border-white/10">
            <iframe
              srcDoc={log.htmlContent}
              title="Email preview"
              className="h-[600px] w-full bg-white"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}

      {!log.htmlContent &&
        log.textContent &&
        (() => {
          const resolvedText = compileTemplate(log.textContent!, variables)
            .replace(/\{\{\w+\}\}/g, '')
            .trim()
          return resolvedText ? (
            <div className="mt-12">
              <Subheading>Email Content</Subheading>
              <Divider className="mt-4" />
              <p className="mt-4 whitespace-pre-wrap text-sm/6 text-zinc-500 dark:text-zinc-400">
                {resolvedText}
              </p>
            </div>
          ) : null
        })()}
    </>
  )
}
