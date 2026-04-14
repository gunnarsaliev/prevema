import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ImageTemplatesList } from './image-templates/components/ImageTemplatesList'
import { EmailTemplatesList } from './email-templates/components/EmailTemplatesList'
import { MediaList } from './components/MediaList'
import { AssetsGridSkeleton } from './components/AssetsGridSkeleton'
import { ImageIcon, Mail, FileImage, Plus } from 'lucide-react'
import { getUserOrganizationIds } from '@/access/utilities'
import {
  getCachedImageTemplates,
  getCachedEmailTemplates,
  getCachedMedia,
} from '@/lib/cached-queries'

async function ImageTemplatesData({ organizationIds }: { organizationIds: number[] }) {
  const docs = await getCachedImageTemplates(organizationIds)
  return <ImageTemplatesList templates={docs as any} />
}

async function EmailTemplatesData({ organizationIds }: { organizationIds: number[] }) {
  const docs = await getCachedEmailTemplates(organizationIds)
  return <EmailTemplatesList templates={docs as any} />
}

async function MediaData({ organizationIds }: { organizationIds: number[] }) {
  const docs = await getCachedMedia(organizationIds)
  return <MediaList media={docs as any} />
}

export default async function AssetsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const rawOrgIds = await getUserOrganizationIds(payload, user)
  const organizationIds = rawOrgIds.map(Number)

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
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
              <Suspense fallback={<AssetsGridSkeleton />}>
                <ImageTemplatesData organizationIds={organizationIds} />
              </Suspense>
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
              <Suspense fallback={<AssetsGridSkeleton />}>
                <EmailTemplatesData organizationIds={organizationIds} />
              </Suspense>
            </TabsContent>

            <TabsContent value="media" className="mt-0">
              <Suspense fallback={<AssetsGridSkeleton />}>
                <MediaData organizationIds={organizationIds} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
