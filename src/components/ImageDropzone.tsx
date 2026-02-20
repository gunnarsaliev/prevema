'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2 } from 'lucide-react'

type ImageDropzoneProps = {
  onUpload: (file: File) => Promise<{ success: boolean; error?: string }>
  maxSizeMB?: number
  acceptedFormats?: string[]
}

export function ImageDropzone({
  onUpload,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
}: ImageDropzoneProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setError(null)
      setUploading(true)

      try {
        const result = await onUpload(file)
        if (!result.success) {
          setError(result.error || 'Failed to upload image')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image')
      } finally {
        setUploading(false)
      }
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce(
      (acc, format) => ({ ...acc, [format]: [] }),
      {} as Record<string, string[]>,
    ),
    maxSize: maxSizeMB * 1024 * 1024,
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`aspect-square w-full max-w-sm rounded-lg border-2 border-dashed transition-colors cursor-pointer
          ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/50'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          flex items-center justify-center`}
      >
        <input {...getInputProps()} />
        <div className="text-center p-6">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading image...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                {isDragActive ? 'Drop image here' : 'Upload profile image'}
              </p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                JPEG, PNG, WebP, SVG • Max {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </div>
      )}
    </div>
  )
}
