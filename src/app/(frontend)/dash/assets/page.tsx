import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { TopBar } from '@/components/shared/TopBar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ImageTemplatesList } from './image-templates/components/ImageTemplatesList'
import { EmailTemplatesList } from './email-templates/components/EmailTemplatesList'
import { MediaList } from './components/MediaList'
import { ImageIcon, Mail, FileImage, Plus } from 'lucide-react'

export default async function AssetsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  // Fetch image templates
  const { docs: imageTemplates } = await payload.find({
    collection: 'image-templates',
    overrideAccess: false,
    user,
    depth: 1,
    limit: 500,
    sort: '-updatedAt',
  })

  // Fetch email templates
  const { docs: emailTemplates } = await payload.find({
    collection: 'email-templates',
    overrideAccess: false,
    user,
    depth: 0,
    limit: 500,
    sort: '-updatedAt',
  })

  // Fetch media files (with depth:1 to get organization info, exclude template assets)
  const { docs: mediaFiles } = await payload.find({
    collection: 'media',
    overrideAccess: false,
    user,
    depth: 1,
    limit: 500,
    sort: '-updatedAt',
    where: {
      or: [{ isTemplateAsset: { equals: false } }, { isTemplateAsset: { exists: false } }],
    },
  })

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Assets"
        description="Manage your image templates, email templates, and media files"
      />
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="p-8">
          <Tabs defaultValue="image-templates" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="image-templates" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Image Templates
              </TabsTrigger>
              <TabsTrigger value="email-templates" className="gap-2">
                <Mail className="h-4 w-4" />
                Email Templates
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-2">
                <FileImage className="h-4 w-4" />
                Media
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image-templates" className="mt-0">
              <div className="mb-4 flex justify-end">
                <Button asChild>
                  <Link href="/dash/image-generator">
                    <Plus className="mr-2 h-4 w-4" />
                    Create template
                  </Link>
                </Button>
              </div>
              <ImageTemplatesList templates={imageTemplates as any} />
            </TabsContent>

            <TabsContent value="email-templates" className="mt-0">
              <div className="mb-4 flex justify-end">
                <Button asChild>
                  <Link href="/dash/assets/email-templates/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create template
                  </Link>
                </Button>
              </div>
              <EmailTemplatesList templates={emailTemplates as any} />
            </TabsContent>

            <TabsContent value="media" className="mt-0">
              <MediaList media={mediaFiles as any} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
