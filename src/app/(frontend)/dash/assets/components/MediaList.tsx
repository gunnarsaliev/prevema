'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { handleEntityDelete } from '@/lib/entity-actions'
import { AssetCard } from '@/components/shared/AssetCard'

type Media = {
  id: number
  alt?: string | null
  filename?: string | null
  url?: string | null
  thumbnailURL?: string | null
  mimeType?: string | null
  filesize?: number | null
  width?: number | null
  height?: number | null
  updatedAt: string
}

interface MediaListProps {
  media: Media[]
}

export function MediaList({ media }: MediaListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    await handleEntityDelete(
      { id, name },
      {
        apiEndpoint: '/api/media',
        entityName: 'media file',
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

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium">No media files yet</p>
        <p className="text-sm text-muted-foreground">
          Upload media files to use in your templates and events
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {media.map((file) => (
        <AssetCard
          key={file.id}
          asset={{
            id: file.id,
            name: file.filename || 'Unnamed file',
            filename: file.filename,
            previewImage: file.url
              ? { url: file.url, thumbnailURL: file.thumbnailURL || undefined }
              : null,
            filesize: file.filesize,
            width: file.width,
            height: file.height,
            updatedAt: file.updatedAt,
          }}
          variant="media"
          assetType="media"
          onDelete={handleDelete}
          isDeleting={deletingId === file.id}
        />
      ))}
    </div>
  )
}
