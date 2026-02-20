import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { ImageTemplatesList } from './components/ImageTemplatesList'

export default async function ImageTemplatesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const { docs: templates } = await payload.find({
    collection: 'image-templates',
    overrideAccess: false,
    user,
    depth: 0,
    limit: 500,
    sort: '-updatedAt',
  })

  return (
    <div className="px-6 py-8">
      <ImageTemplatesList templates={templates} />
    </div>
  )
}
