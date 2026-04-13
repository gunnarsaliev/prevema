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

  // Extract text from Lexical format
  const extractTextFromLexical = (lexical: any): string => {
    if (typeof lexical === 'string') return lexical

    try {
      // Lexical format: root.children contains paragraphs, each with children containing text nodes
      const children = lexical?.root?.children || []
      return children
        .map((paragraph: any) => {
          const textNodes = paragraph?.children || []
          return textNodes.map((node: any) => node.text || '').join('')
        })
        .join('\n')
    } catch {
      return ''
    }
  }

  const htmlBodyText = extractTextFromLexical(template.htmlBody)

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dash/assets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to assets
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
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge variant={template.isActive ? 'default' : 'secondary'}>
            {template.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Email Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Subject</label>
            <p className="text-base">{template.subject}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Message</label>
            <div className="rounded-md bg-muted/30 p-4 font-mono text-sm whitespace-pre-wrap border">
              {htmlBodyText}
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-2">
            Available variables: firstName, lastName, email, eventName, eventDate, organizationName
          </div>
        </div>

        {/* Automation Settings - Only show if configured */}
        {template.automationTriggers?.triggerEvent &&
          template.automationTriggers.triggerEvent !== 'none' && (
            <>
              <Separator />
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Automation Settings
                </summary>
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Trigger Event
                      </label>
                      <p className="text-sm">
                        {formatTriggerEvent(template.automationTriggers.triggerEvent)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Delay (Minutes)
                      </label>
                      <p className="text-sm">{template.automationTriggers?.delayMinutes ?? 0}</p>
                    </div>
                  </div>
                </div>
              </details>
            </>
          )}

        <Separator />

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Created: {new Date(template.createdAt).toLocaleString()}</div>
          <div>Updated: {new Date(template.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
