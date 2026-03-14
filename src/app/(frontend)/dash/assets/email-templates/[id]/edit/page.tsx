import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { EmailTemplateForm } from '../../components/EmailTemplateForm'
import type { EmailTemplateFormValues } from '@/lib/schemas/emailTemplate'

export default async function EditEmailTemplatePage({
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

  const defaultValues: EmailTemplateFormValues = {
    name: template.name,
    description: template.description ?? null,
    subject: template.subject,
    htmlBody: extractTextFromLexical(template.htmlBody),
    isActive: template.isActive ?? true,
    triggerEvent:
      (template.automationTriggers?.triggerEvent as EmailTemplateFormValues['triggerEvent']) ??
      'none',
    statusFilter: template.automationTriggers?.statusFilter as
      | EmailTemplateFormValues['statusFilter']
      | undefined,
    customTriggerName: template.automationTriggers?.customTriggerName ?? null,
    delayMinutes: template.automationTriggers?.delayMinutes ?? 0,
    conditions: template.automationTriggers?.conditions ?? null,
  }

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit email template</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your email template for automated communications.
        </p>
      </div>
      <EmailTemplateForm
        mode="edit"
        templateId={String(template.id)}
        defaultValues={defaultValues}
        displayMode="simple"
      />
    </div>
  )
}
