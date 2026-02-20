import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Pencil, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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

  const formatUsageType = (type: string) => {
    const map: Record<string, string> = {
      participant: 'Participants',
      partner: 'Partners',
      both: 'Both',
    }
    return map[type] || type
  }

  const getMediaUrl = (media: unknown): string | null => {
    if (!media) return null
    if (typeof media === 'object' && media !== null && 'url' in media) {
      return (media as { url: string }).url
    }
    return null
  }

  const backgroundImageUrl = getMediaUrl(template.backgroundImage)
  const previewImageUrl = getMediaUrl(template.previewImage)

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
        {/* Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={template.isActive ? 'default' : 'secondary'}>
              {template.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Usage:</span>
            <span className="text-sm text-muted-foreground">
              {formatUsageType(template.usageType)}
            </span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Size:</span>
            <span className="text-sm text-muted-foreground font-mono">
              {template.width} × {template.height}
            </span>
          </div>
        </div>

        <Separator />

        {/* Preview */}
        {previewImageUrl && (
          <>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Preview</h2>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <img
                  src={previewImageUrl}
                  alt={template.name}
                  className="max-w-full h-auto rounded"
                />
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Canvas Settings */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Canvas Settings</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Dimensions
              </label>
              <p className="mt-1 text-sm font-mono">
                {template.width} × {template.height} px
              </p>
            </div>

            {template.backgroundColor && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Background Color
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: template.backgroundColor }}
                  />
                  <p className="text-sm font-mono">{template.backgroundColor}</p>
                </div>
              </div>
            )}

            {backgroundImageUrl && (
              <div className="rounded-lg border bg-muted/30 p-4 col-span-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Background Image
                </label>
                <div className="mt-2">
                  <img
                    src={backgroundImageUrl}
                    alt="Background"
                    className="max-w-sm h-auto rounded border"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Elements */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Elements Data</h2>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              Canvas Elements (JSON)
            </label>
            <pre className="mt-2 text-xs font-mono bg-background p-3 rounded border overflow-x-auto">
              {JSON.stringify(template.elements, null, 2)}
            </pre>
          </div>
        </div>

        <Separator />

        {/* Metadata */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Metadata</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Template ID:</span>
              <span className="ml-2 font-mono">{template.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Slug:</span>
              <span className="ml-2 font-mono">{template.slug}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2">{new Date(template.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <span className="ml-2">{new Date(template.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
