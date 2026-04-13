'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ImageIcon,
  Mail,
  FileImage,
  Check,
  Plus,
  Loader2,
  Pencil,
  Copy,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type AssetType = 'image-template' | 'email-template' | 'media'

export interface Asset {
  id: number
  name: string
  previewImage?: {
    url?: string
    thumbnailURL?: string
  } | null
  updatedAt: string
  organization?: {
    name?: string
  }
  isPremium?: boolean
  isPublic?: boolean
  isActive?: boolean
  // Image template specific
  width?: number | null
  height?: number | null
  // Email template specific
  subject?: string | null
  description?: string | null
  // Media specific
  filename?: string | null
  filesize?: number | null
  mimeType?: string | null
}

interface LibraryVariantProps {
  variant: 'library'
  assetType: Extract<AssetType, 'image-template' | 'email-template'>
  isAlreadyAdded: boolean
  hasOrganizations: boolean
}

interface ManageVariantProps {
  variant: 'manage'
  assetType: Extract<AssetType, 'image-template' | 'email-template'>
  onDelete: (id: number, name: string) => void
  isDeleting?: boolean
  editUrl: string
  duplicateUrl: string
}

interface MediaVariantProps {
  variant: 'media'
  assetType: 'media'
  onDelete: (id: number, name: string) => void
  isDeleting?: boolean
}

type AssetCardProps = {
  asset: Asset
} & (LibraryVariantProps | ManageVariantProps | MediaVariantProps)

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getAssetIcon(type: AssetType) {
  switch (type) {
    case 'image-template':
      return ImageIcon
    case 'email-template':
      return Mail
    case 'media':
      return FileImage
  }
}

export function AssetCard(props: AssetCardProps) {
  const { asset, variant, assetType } = props
  const previewUrl = asset.previewImage?.thumbnailURL || asset.previewImage?.url
  const Icon = getAssetIcon(assetType)

  // Build meta information based on asset type
  const metaParts: string[] = []

  if (assetType === 'image-template') {
    if (asset.organization?.name) metaParts.push(`by ${asset.organization.name}`)
    if (asset.width && asset.height) metaParts.push(`${asset.width} × ${asset.height}`)
  } else if (assetType === 'email-template') {
    if (asset.subject) metaParts.push(asset.subject)
    if (asset.description) metaParts.push(asset.description)
  } else if (assetType === 'media') {
    const sizeStr = formatFileSize(asset.filesize)
    if (sizeStr) metaParts.push(sizeStr)
    if (asset.width && asset.height) metaParts.push(`${asset.width} × ${asset.height}`)
  }

  const meta = metaParts.join('  |  ')

  const cardContent = (
    <div className="group rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      {/* Preview area */}
      <div className="relative aspect-[4/3] bg-muted shrink-0">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={asset.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Top-right overlays */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {asset.isPremium && (
            <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
              Premium
            </Badge>
          )}
          {asset.isPublic !== undefined && !asset.isPublic && assetType !== 'media' && (
            <Badge variant="secondary" className="backdrop-blur-sm">
              Private
            </Badge>
          )}
          {asset.isActive !== undefined && assetType === 'email-template' && (
            <Badge variant={asset.isActive ? 'default' : 'secondary'} className="backdrop-blur-sm">
              {asset.isActive ? 'Active' : 'Inactive'}
            </Badge>
          )}
          {variant === 'manage' && (
            <ManageMenu
              asset={asset}
              onDelete={props.onDelete}
              isDeleting={props.isDeleting}
              editUrl={props.editUrl}
              duplicateUrl={props.duplicateUrl}
            />
          )}
          {variant === 'media' && (
            <MediaMenu asset={asset} onDelete={props.onDelete} isDeleting={props.isDeleting} />
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-sm leading-tight">
            {assetType === 'media' ? asset.filename || asset.name : asset.name}
          </p>
          {meta && <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>}
        </div>

        {variant === 'library' && (
          <LibraryAction
            assetId={asset.id}
            assetType={assetType}
            isAlreadyAdded={props.isAlreadyAdded}
            hasOrganizations={props.hasOrganizations}
          />
        )}
      </div>
    </div>
  )

  // Make manage variants clickable to edit
  if (variant === 'manage') {
    return (
      <Link href={props.editUrl} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

function LibraryAction({
  assetId,
  assetType,
  isAlreadyAdded,
  hasOrganizations,
}: {
  assetId: number
  assetType: Extract<AssetType, 'image-template' | 'email-template'>
  isAlreadyAdded: boolean
  hasOrganizations: boolean
}) {
  const [isCopying, setIsCopying] = useState(false)
  const [hasCopied, setHasCopied] = useState(isAlreadyAdded)

  const handleCopy = async () => {
    if (hasCopied || !hasOrganizations) return
    setIsCopying(true)
    try {
      const response = await fetch('/api/library/copy-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: assetId,
          templateType: assetType === 'image-template' ? 'image' : 'email',
        }),
      })
      const data = await response.json()
      if (data.success) {
        setHasCopied(true)
      } else {
        console.error('Failed to copy template:', data.error)
      }
    } catch (error) {
      console.error('Error copying template:', error)
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      disabled={isCopying || hasCopied || !hasOrganizations}
      size="sm"
      className="shrink-0 rounded-full"
      variant={hasCopied ? 'outline' : 'default'}
    >
      {isCopying ? (
        <>
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          Copying...
        </>
      ) : hasCopied ? (
        <>
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Added
        </>
      ) : (
        <>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add to library
        </>
      )}
    </Button>
  )
}

function ManageMenu({
  asset,
  onDelete,
  isDeleting,
  editUrl,
  duplicateUrl,
}: {
  asset: Asset
  onDelete: (id: number, name: string) => void
  isDeleting?: boolean
  editUrl: string
  duplicateUrl: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={editUrl} onClick={(e) => e.stopPropagation()}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={duplicateUrl} onClick={(e) => e.stopPropagation()}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onDelete(asset.id, asset.name)
          }}
          disabled={isDeleting}
          className="text-destructive focus:text-destructive"
        >
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MediaMenu({
  asset,
  onDelete,
  isDeleting,
}: {
  asset: Asset
  onDelete: (id: number, name: string) => void
  isDeleting?: boolean
}) {
  return (
    <div
      className="opacity-0 transition-opacity group-hover:opacity-100"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="destructive"
        size="icon"
        className="h-7 w-7"
        onClick={() => onDelete(asset.id, asset.filename || asset.name)}
        disabled={isDeleting}
      >
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  )
}
