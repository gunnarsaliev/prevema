import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/shared/TopBar'

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
    depth: 1,
    limit: 500,
    sort: '-updatedAt',
  })

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Image Templates"
        description="Manage saved canvas templates for bulk image generation"
        actions={
          <Button asChild>
            <Link href="/dash/image-generator">
              <Plus className="mr-2 h-4 w-4" />
              Create template
            </Link>
          </Button>
        }
      />
      <div className="px-8 py-8">
        <ImageTemplatesList templates={templates as any} />
      </div>
    </div>
  )
}
