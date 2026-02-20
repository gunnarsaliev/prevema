import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { EmailTemplateForm } from '../components/EmailTemplateForm'

export default async function CreateEmailTemplatePage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create email template</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new email template for automated communications.
        </p>
      </div>
      <EmailTemplateForm mode="create" />
    </div>
  )
}
