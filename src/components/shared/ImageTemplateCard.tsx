'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ImageIcon, Check, Plus, Loader2, Pencil, Copy, Trash2, MoreHorizontal } from 'lucide-react'
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

export interface ImageTemplateCardTemplate {
  id: number
  name: string
  previewImage?: {
    url?: string
    thumbnailURL?: string
  }
  updatedAt: string
  organization?: {
    name?: string
  }
  isPremium?: boolean
  isPublic?: boolean
  width?: number
  height?: number
}

interface LibraryVariantProps {
  variant: 'library'
  isAlreadyAdded: boolean
  hasOrganizations: boolean
}

interface ManageVariantProps {
  variant: 'manage'
  onDelete: (id: number, name: string) => void
  isDeleting?: boolean
}

type ImageTemplateCardProps = {
  template: ImageTemplateCardTemplate
} & (LibraryVariantProps | ManageVariantProps)

export function ImageTemplateCard(props: ImageTemplateCardProps) {
  const { template } = props
  const previewUrl = template.previewImage?.thumbnailURL || template.previewImage?.url

  const meta = [
    template.organization?.name && `by ${template.organization.name}`,
    template.width && template.height && `${template.width} × ${template.height}`,
  ]
    .filter(Boolean)
    .join('  |  ')

  return (
    <div className="group rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      {/* Preview image — large, fills top */}
      <div className="relative aspect-[4/3] bg-muted shrink-0">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={template.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Top-right overlays */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {template.isPremium && (
            <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
              Premium
            </Badge>
          )}
          {props.variant === 'manage' && (
            <ManageMenu
              template={template}
              onDelete={props.onDelete}
              isDeleting={props.isDeleting}
            />
          )}
        </div>
      </div>

      {/* Bottom row: title + meta left, CTA right */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-sm leading-tight">
            {props.variant === 'manage' ? (
              <Link
                href={`/dash/assets/image-templates/${template.id}`}
                className="hover:underline"
              >
                {template.name}
              </Link>
            ) : (
              template.name
            )}
          </p>
          {meta && <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>}
        </div>

        {props.variant === 'library' ? (
          <LibraryAction
            templateId={template.id}
            isAlreadyAdded={props.isAlreadyAdded}
            hasOrganizations={props.hasOrganizations}
          />
        ) : (
          <Button asChild size="sm" className="shrink-0 rounded-full">
            <Link href={`/dash/assets/image-templates/${template.id}/edit`}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

function LibraryAction({
  templateId,
  isAlreadyAdded,
  hasOrganizations,
}: {
  templateId: number
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
        body: JSON.stringify({ templateId, templateType: 'image' }),
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
  template,
  onDelete,
  isDeleting,
}: {
  template: ImageTemplateCardTemplate
  onDelete: (id: number, name: string) => void
  isDeleting?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="h-7 w-7">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/dash/assets/image-templates/${template.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dash/assets/image-templates/create?clone=${template.id}`}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(template.id, template.name)}
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
