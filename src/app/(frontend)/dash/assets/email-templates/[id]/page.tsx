import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Pencil, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default async function EmailTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const template = await payload
    .findByID({
      collection: 'email-templates',
      id: Number(id),
      overrideAccess: false,
      user,
      depth: 0,
    })
    .catch(() => null)

  if (!template) notFound()

  const formatTriggerEvent = (event?: string | null) => {
    if (!event || event === 'none') return 'Manual'
    return event
      .split('.')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const htmlBodyText =
    typeof template.htmlBody === 'string'
      ? template.htmlBody
      : JSON.stringify(template.htmlBody, null, 2)

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dash/assets/email-templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to templates
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{template.name}</h1>
            {template.description && (
              <p className="text-sm text-muted-foreground">{template.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/dash/assets/email-templates/${template.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={template.isActive ? 'default' : 'secondary'}>
              {template.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Trigger:</span>
            <span className="text-sm text-muted-foreground">
              {formatTriggerEvent(template.automationTriggers?.triggerEvent)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Email Content */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Email Content</h2>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Subject
              </label>
              <p className="mt-1 text-sm">{template.subject}</p>
            </div>

            <Separator />

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase">Body</label>
              <div className="mt-1 rounded-md bg-background p-3 font-mono text-xs whitespace-pre-wrap border">
                {htmlBodyText}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Automation Settings */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Automation Settings</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Trigger Event
              </label>
              <p className="mt-1 text-sm">
                {formatTriggerEvent(template.automationTriggers?.triggerEvent)}
              </p>
            </div>

            {template.automationTriggers?.triggerEvent === 'custom' && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Custom Trigger Name
                </label>
                <p className="mt-1 text-sm">
                  {template.automationTriggers?.customTriggerName || '—'}
                </p>
              </div>
            )}

            <div className="rounded-lg border bg-muted/30 p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Delay (Minutes)
              </label>
              <p className="mt-1 text-sm">{template.automationTriggers?.delayMinutes ?? 0}</p>
            </div>

            {template.automationTriggers?.conditions && (
              <div className="rounded-lg border bg-muted/30 p-4 col-span-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Conditions
                </label>
                <pre className="mt-1 text-xs font-mono bg-background p-2 rounded border">
                  {template.automationTriggers.conditions}
                </pre>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Metadata */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Metadata</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Template ID:</span>
              <span className="ml-2 font-mono">{template.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Slug:</span>
              <span className="ml-2 font-mono">{template.slug}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2">{new Date(template.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <span className="ml-2">{new Date(template.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
