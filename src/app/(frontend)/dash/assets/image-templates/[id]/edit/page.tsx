import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { ImageTemplateForm } from '../../components/ImageTemplateForm'
import type { ImageTemplateFormValues } from '@/lib/schemas/imageTemplate'

export default async function EditImageTemplatePage({
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
      depth: 0,
    })
    .catch(() => null)

  if (!template) notFound()

  // Resolve relationship IDs
  const resolveId = (rel: unknown): number | undefined => {
    if (!rel) return undefined
    if (typeof rel === 'object' && rel !== null && 'id' in rel) return (rel as { id: number }).id
    if (typeof rel === 'number') return rel
    return undefined
  }

  const defaultValues: ImageTemplateFormValues = {
    name: template.name,
    usageType: template.usageType as ImageTemplateFormValues['usageType'],
    isActive: template.isActive ?? true,
    width: template.width,
    height: template.height,
    backgroundImage: resolveId(template.backgroundImage) ?? null,
    backgroundColor: template.backgroundColor ?? null,
    elements: JSON.stringify(template.elements, null, 2),
    previewImage: resolveId(template.previewImage) ?? null,
  }

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit image template</h1>
        <p className="text-sm text-muted-foreground mt-1">{template.name}</p>
      </div>
      <ImageTemplateForm mode="edit" templateId={String(template.id)} defaultValues={defaultValues} />
    </div>
  )
}
