import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { TopBar } from '@/components/shared/TopBar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageTemplatesList } from './image-templates/components/ImageTemplatesList'
import { EmailTemplatesList } from './email-templates/components/EmailTemplatesList'
import { MediaList } from './components/MediaList'
import { Image, Mail, FileImage } from 'lucide-react'

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

  // Fetch media files
  const { docs: mediaFiles } = await payload.find({
    collection: 'media',
    overrideAccess: false,
    user,
    depth: 0,
    limit: 500,
    sort: '-updatedAt',
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
                <Image className="h-4 w-4" />
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
              <ImageTemplatesList templates={imageTemplates as any} />
            </TabsContent>

            <TabsContent value="email-templates" className="mt-0">
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
