import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { ImageTemplateForm } from '../components/ImageTemplateForm'

export default async function CreateImageTemplatePage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create image template</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new canvas template for bulk image generation.
        </p>
      </div>
      <ImageTemplateForm mode="create" />
    </div>
  )
}
