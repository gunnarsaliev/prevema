import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Pencil, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

export default async function ImageTemplateDetailPage({
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
      collection: 'image-templates',
      id: Number(id),
      overrideAccess: false,
      user,
      depth: 1, // Resolve media relationships
    })
    .catch(() => null)

  if (!template) notFound()

  const getMediaUrl = (media: unknown): string | null => {
    if (!media) return null
    if (typeof media === 'object' && media !== null && 'url' in media) {
      return (media as { url: string }).url
    }
    return null
  }

  const previewImageUrl = getMediaUrl(template.previewImage)
  const lastEdited = formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dash/assets/image-templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to templates
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{template.name}</h1>
            <p className="text-sm text-muted-foreground">Last edited {lastEdited}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/dash/assets/image-templates/${template.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Dimensions */}
        <div className="rounded-lg border bg-muted/30 p-4 inline-block">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Dimensions
          </label>
          <p className="mt-1 text-sm font-mono">
            {template.width} × {template.height} px
          </p>
        </div>

        {/* Preview */}
        {previewImageUrl && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <img
                src={previewImageUrl}
                alt={template.name}
                className="max-w-full h-auto rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
