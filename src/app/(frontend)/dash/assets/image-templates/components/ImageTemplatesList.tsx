'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { handleEntityDelete } from '@/lib/entity-actions'
import { ImageTemplateCard } from '@/components/shared/ImageTemplateCard'

type ImageTemplate = {
  id: number
  name: string
  isActive?: boolean
  isPublic?: boolean
  isPremium?: boolean
  width: number
  height: number
  updatedAt: string
  previewImage?: {
    url?: string
    thumbnailURL?: string
  }
  organization?: {
    name?: string
  }
}

interface ImageTemplatesListProps {
  templates: ImageTemplate[]
}

export function ImageTemplatesList({ templates }: ImageTemplatesListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    await handleEntityDelete(
      { id, name },
      {
        apiEndpoint: '/api/image-templates',
        entityName: 'image template',
      },
      {
        onStart: () => setDeletingId(id),
        onSuccess: () => {
          router.refresh()
          setDeletingId(null)
        },
        onError: () => setDeletingId(null),
      },
    )
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium">No image templates yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first image template to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((template) => (
        <ImageTemplateCard
          key={template.id}
          template={template}
          variant="manage"
          onDelete={handleDelete}
          isDeleting={deletingId === template.id}
        />
      ))}
    </div>
  )
}
