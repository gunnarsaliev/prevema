import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import Link from 'next/link'
import type { Metadata } from 'next'

import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'
import { compileTemplate } from '@/utils/templateEngine'
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
import { Heading } from '@/components/catalyst/heading'
import { Badge } from '@/components/catalyst/badge'
import type { EmailLog } from '@/payload-types'
import { Send, CheckCircle2, Clock, AlertCircle, Mail } from 'lucide-react'

export const metadata: Metadata = { title: 'Email History' }

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

function resolveSubject(subject: string, variables?: string | null): string {
  let vars: Record<string, string> = {}
  if (variables) {
    try { vars = JSON.parse(variables) } catch { /* ignore */ }
  }
  return compileTemplate(subject, vars).replace(/\{\{\w+\}\}/g, '').trim() || subject
}

export default async function EmailLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))
  const limit = 50

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const rawOrgIds = await getUserOrganizationIds(payload, user)
  const organizationIds = rawOrgIds.map(Number).filter((n) => !isNaN(n))
  if (organizationIds.length === 0) notFound()

  const where =
    organizationIds.length > 0
      ? {
          and: [
            { organization: { in: organizationIds } },
            { direction: { equals: 'outbound' } },
          ],
        }
      : { direction: { equals: 'outbound' } }

  const { docs, totalPages, totalDocs } = await payload.find({
    collection: 'email-logs',
    overrideAccess: true,
    where: where as any,
    depth: 0,
    limit,
    page: currentPage,
    sort: '-sentAt',
  })

  const logs = docs as EmailLog[]

  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Dashboard', href: '/tw/dash' },
          { label: 'Email History' },
        ]}
      />

      <div className="mt-4 lg:mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Heading>Email History</Heading>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {totalDocs} {totalDocs === 1 ? 'email' : 'emails'} total
          </p>
        </div>
      </div>

      <div className="mt-8">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <Mail className="size-8 text-zinc-400" />
            <p className="text-sm text-zinc-500">No emails sent yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
                  <th className="py-3 pl-4 pr-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Subject
                  </th>
                  <th className="hidden px-3 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:table-cell">
                    To
                  </th>
                  <th className="hidden px-3 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 md:table-cell">
                    Trigger
                  </th>
                  <th className="hidden px-3 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 lg:table-cell">
                    Template
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Status
                  </th>
                  <th className="hidden py-3 pl-3 pr-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:table-cell">
                    Sent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => {
                  const subject = resolveSubject(log.subject, log.variables)
                  const sentDate = log.sentAt
                    ? new Date(log.sentAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'
                  return (
                    <tr
                      key={log.id}
                      className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <td className="py-3 pl-4 pr-3">
                        <Link
                          href={`/tw/dash/email-logs/${log.id}`}
                          className="font-medium text-zinc-900 group-hover:underline dark:text-white"
                        >
                          {subject}
                        </Link>
                      </td>
                      <td className="hidden px-3 py-3 text-zinc-500 dark:text-zinc-400 sm:table-cell">
                        <div className="max-w-[200px] truncate">
                          {log.toName ? (
                            <span>
                              {log.toName}{' '}
                              <span className="text-xs opacity-60">{log.toEmail}</span>
                            </span>
                          ) : (
                            log.toEmail
                          )}
                        </div>
                      </td>
                      <td className="hidden px-3 py-3 text-zinc-500 dark:text-zinc-400 md:table-cell">
                        {log.triggerEvent
                          ? (TRIGGER_LABELS[log.triggerEvent] ?? log.triggerEvent)
                          : '—'}
                      </td>
                      <td className="hidden px-3 py-3 text-zinc-500 dark:text-zinc-400 lg:table-cell">
                        {log.templateName ?? '—'}
                      </td>
                      <td className="px-3 py-3">
                        <Badge color={STATUS_COLOR[log.status] ?? 'zinc'} className="capitalize">
                          {log.status}
                        </Badge>
                      </td>
                      <td className="hidden py-3 pl-3 pr-4 text-xs text-zinc-500 dark:text-zinc-400 sm:table-cell whitespace-nowrap">
                        {sentDate}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <p>
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/tw/dash/email-logs?page=${currentPage - 1}`}
                  className="rounded-lg border px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Previous
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/tw/dash/email-logs?page=${currentPage + 1}`}
                  className="rounded-lg border px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
