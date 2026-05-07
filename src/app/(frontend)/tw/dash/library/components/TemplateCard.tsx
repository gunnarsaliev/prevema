'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Mail, Check, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Template {
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
}

interface TemplateCardProps {
  template: Template
  type: 'image' | 'email'
  isAlreadyAdded: boolean
  hasOrganizations: boolean
}

export function TemplateCard({
  template,
  type,
  isAlreadyAdded,
  hasOrganizations,
}: TemplateCardProps) {
  const [isCopying, setIsCopying] = useState(false)
  const [hasCopied, setHasCopied] = useState(isAlreadyAdded)

  const handleCopy = async () => {
    if (hasCopied || !hasOrganizations) return

    setIsCopying(true)

    try {
      const response = await fetch('/api/library/copy-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          templateType: type,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setHasCopied(true)
        // Optionally show a toast notification here
      } else {
        console.error('Failed to copy template:', data.error)
        // Optionally show an error toast
      }
    } catch (error) {
      console.error('Error copying template:', error)
      // Optionally show an error toast
    } finally {
      setIsCopying(false)
    }
  }

  const Icon = type === 'image' ? ImageIcon : Mail
  const previewUrl = template.previewImage?.thumbnailURL || template.previewImage?.url

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Preview Image */}
      <div className="relative aspect-video bg-muted">
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
            <Icon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Premium Badge */}
        {template.isPremium && (
          <Badge className="absolute right-2 top-2" variant="default">
            Premium
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-base">{template.name}</CardTitle>
        {template.organization?.name && (
          <p className="text-xs text-muted-foreground">
            by {template.organization.name}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-xs text-muted-foreground">
          Updated {new Date(template.updatedAt).toLocaleDateString()}
        </p>
      </CardContent>

      {/* Actions */}
      <CardFooter className="pt-0">
        <Button
          onClick={handleCopy}
          disabled={isCopying || hasCopied || !hasOrganizations}
          className="w-full"
          variant={hasCopied ? 'outline' : 'default'}
        >
          {isCopying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Copying...
            </>
          ) : hasCopied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Added
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add to My Organization
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
